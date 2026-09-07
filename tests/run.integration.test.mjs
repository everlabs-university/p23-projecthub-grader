import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const GRADER_ROOT = fileURLToPath(new URL('..', import.meta.url));
const RUNNER = join('src', 'run.mjs');
const PASS_FIXTURE = join(GRADER_ROOT, 'fixtures', 'pr01-pass');
const FAIL_FIXTURE = join(GRADER_ROOT, 'fixtures', 'pr01-fail');
const TEMP_SUITE_DIRNAME = '.projecthub-grader';
const STUDENT_SHA = '0123456789abcdef0123456789abcdef01234567';
const RUN_TIMEOUT_MS = 180_000;
const UNCOPIED_SEGMENTS = new Set(['node_modules', '.git', 'fixtures']);

async function graderVersion() {
  const raw = await readFile(join(GRADER_ROOT, 'published.json'), 'utf8');

  return JSON.parse(raw).graderVersion;
}

function runGrader({ graderRoot = GRADER_ROOT, studentRoot, sha = STUDENT_SHA, summaryFile }) {
  const args = [
    join(graderRoot, RUNNER),
    '--student-root',
    studentRoot,
    '--sha',
    sha,
    '--summary-file',
    summaryFile,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: graderRoot,
      env: { ...process.env, CI: 'true', FORCE_COLOR: '0', NO_COLOR: '1' },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', reject);
    child.once('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

/** A copy of the grader repository so published.json can be broken without touching the real one. */
async function copyGraderRoot(destination) {
  await cp(GRADER_ROOT, destination, {
    recursive: true,
    filter: (source) =>
      !relative(GRADER_ROOT, source)
        .split(sep)
        .some((segment) => UNCOPIED_SEGMENTS.has(segment)),
  });

  await symlink(join(GRADER_ROOT, 'node_modules'), join(destination, 'node_modules'), 'junction');
}

function assertTemporarySuiteRemoved(studentRoot) {
  assert.equal(
    existsSync(join(studentRoot, TEMP_SUITE_DIRNAME)),
    false,
    `runner must remove ${TEMP_SUITE_DIRNAME} from ${studentRoot}`,
  );
}

describe('node src/run.mjs', () => {
  let workspace;
  let summaryFile;

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'projecthub-run-'));
    summaryFile = join(workspace, 'summary.md');
  });

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
    await rm(join(PASS_FIXTURE, TEMP_SUITE_DIRNAME), { recursive: true, force: true });
    await rm(join(FAIL_FIXTURE, TEMP_SUITE_DIRNAME), { recursive: true, force: true });
  });

  it(
    'scores the known-good fixture 80/80 PASS and exits 0',
    { timeout: RUN_TIMEOUT_MS },
    async () => {
      const version = await graderVersion();
      const result = await runGrader({ studentRoot: PASS_FIXTURE, summaryFile });

      assert.equal(result.code, 0, `stderr:\n${result.stderr}`);

      const summary = await readFile(summaryFile, 'utf8');

      assert.match(summary, /80\/80/);
      assert.match(summary, /PASS/);
      assert.equal(
        summary.includes('FAIL'),
        false,
        'a fully passing run must not report FAIL',
      );
      assert.ok(summary.includes(STUDENT_SHA), 'summary must contain the supplied student SHA');
      assert.ok(summary.includes(version), 'summary must contain the grader version');
      assertTemporarySuiteRemoved(PASS_FIXTURE);
    },
  );

  it(
    'scores the known-bad fixture 40/80 FAIL and exits 1',
    { timeout: RUN_TIMEOUT_MS },
    async () => {
      const version = await graderVersion();
      const result = await runGrader({ studentRoot: FAIL_FIXTURE, summaryFile });

      assert.equal(result.code, 1, `stderr:\n${result.stderr}`);

      const summary = await readFile(summaryFile, 'utf8');

      assert.match(summary, /40\/80/);
      assert.match(summary, /FAIL/);
      assert.ok(summary.includes(STUDENT_SHA), 'summary must contain the supplied student SHA');
      assert.ok(summary.includes(version), 'summary must contain the grader version');
      assertTemporarySuiteRemoved(FAIL_FIXTURE);
    },
  );

  it(
    'exits 2 when published.json in the grader root is malformed',
    { timeout: RUN_TIMEOUT_MS },
    async () => {
      const graderCopy = join(workspace, 'grader');

      await copyGraderRoot(graderCopy);
      await writeFile(
        join(graderCopy, 'published.json'),
        `{
  "schemaVersion": 1,
  "graderVersion": "2026.09.07.1",
  "labs": ["pr01"
`,
        'utf8',
      );

      const result = await runGrader({
        graderRoot: graderCopy,
        studentRoot: PASS_FIXTURE,
        summaryFile,
      });

      assert.equal(result.code, 2, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
      assert.match(result.stderr, /published\.json/);
      assertTemporarySuiteRemoved(PASS_FIXTURE);
    },
  );

  it(
    'exits 2 when the student root does not exist',
    { timeout: RUN_TIMEOUT_MS },
    async () => {
      const result = await runGrader({
        studentRoot: join(workspace, 'missing-student-root'),
        summaryFile,
      });

      assert.equal(result.code, 2, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
      assert.notEqual(result.stderr.trim(), '', 'an infrastructure failure must be explained');
    },
  );

  it(
    'exits 2 when the student SHA is not a 40-character hex commit id',
    { timeout: RUN_TIMEOUT_MS },
    async () => {
      const result = await runGrader({
        studentRoot: PASS_FIXTURE,
        sha: 'not-a-commit-sha',
        summaryFile,
      });

      assert.equal(result.code, 2, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
      assert.notEqual(result.stderr.trim(), '', 'an infrastructure failure must be explained');
      assertTemporarySuiteRemoved(PASS_FIXTURE);
    },
  );
});
