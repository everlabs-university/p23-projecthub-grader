import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { auditWorkflow } from '../src/audit-workflow.mjs';

const GRADER_ROOT = fileURLToPath(new URL('..', import.meta.url));
const AUDIT_CLI = join('scripts', 'audit-submission.mjs');
const CANONICAL_WORKFLOW = join(GRADER_ROOT, 'canonical', 'student-grade.yml');
const STUDENT_WORKFLOW = join('.github', 'workflows', 'grade.yml');
const WRONG_SHA = '1234567890abcdef1234567890abcdef12345678';
const AUDIT_TIMEOUT_MS = 60_000;

const CHILD_ENV = {
  ...process.env,
  CI: 'true',
  FORCE_COLOR: '0',
  NO_COLOR: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_TERMINAL_PROMPT: '0',
  GIT_AUTHOR_NAME: 'ProjectHub Pilot',
  GIT_AUTHOR_EMAIL: 'pilot@example.com',
  GIT_COMMITTER_NAME: 'ProjectHub Pilot',
  GIT_COMMITTER_EMAIL: 'pilot@example.com',
};

const CANONICAL_TEXT = await readFile(CANONICAL_WORKFLOW, 'utf8');

function sha256Hex(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function spawnCollected(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: CHILD_ENV });
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

async function runGit(args, cwd) {
  const { code, stdout, stderr } = await spawnCollected('git', args, cwd);
  assert.equal(code, 0, `git ${args.join(' ')} завершився кодом ${code}: ${stderr.trim()}`);
  return stdout.trim();
}

function runAudit({ studentRoot, expectedSha }) {
  return spawnCollected(
    process.execPath,
    [join(GRADER_ROOT, AUDIT_CLI), '--student-root', studentRoot, '--expected-sha', expectedSha],
    GRADER_ROOT,
  );
}

async function createStudentRepo(root) {
  await mkdir(join(root, '.github', 'workflows'), { recursive: true });
  await writeFile(join(root, STUDENT_WORKFLOW), CANONICAL_TEXT, 'utf8');
  await writeFile(join(root, 'README.md'), '# ProjectHub\n', 'utf8');
  await runGit(['init', '--initial-branch=main'], root);
  await runGit(['config', 'user.name', 'ProjectHub Pilot'], root);
  await runGit(['config', 'user.email', 'pilot@example.com'], root);
  await runGit(['config', 'commit.gpgsign', 'false'], root);
  await runGit(['config', 'core.autocrlf', 'false'], root);
  await runGit(['add', '--all'], root);
  await runGit(['commit', '--message', 'feat: complete React Router practical'], root);
  const head = await runGit(['rev-parse', 'HEAD'], root);
  assert.match(head, /^[0-9a-f]{40}$/, 'фікстура мусить дати 40-символьний HEAD');
  assert.equal(await runGit(['status', '--porcelain'], root), '', 'фікстура мусить бути чистою');
  return head;
}

function assertTamperRejected(candidateText, reason) {
  assert.notEqual(candidateText, CANONICAL_TEXT, `${reason}: підміна мусить змінити байти`);
  const result = auditWorkflow({ candidateText, canonicalText: CANONICAL_TEXT });
  assert.equal(result.valid, false, reason);
  assert.notEqual(result.candidateSha256, result.canonicalSha256, reason);
  assert.equal(result.candidateSha256, sha256Hex(candidateText));
  assert.equal(result.canonicalSha256, sha256Hex(CANONICAL_TEXT));
}

describe('auditWorkflow', () => {
  it('accepts a byte-identical canonical workflow with matching lowercase SHA-256 values', () => {
    const result = auditWorkflow({ candidateText: CANONICAL_TEXT, canonicalText: CANONICAL_TEXT });
    assert.equal(result.valid, true);
    assert.equal(result.candidateSha256, result.canonicalSha256);
    assert.equal(result.canonicalSha256, sha256Hex(CANONICAL_TEXT));
    assert.match(result.candidateSha256, /^[0-9a-f]{64}$/);
    assert.match(result.canonicalSha256, /^[0-9a-f]{64}$/);
  });

  it('rejects one changed reusable workflow ref with distinct hashes', () => {
    assertTamperRejected(CANONICAL_TEXT.replace('@semester-2026', '@semester-2025'), 'змінений ref reusable workflow');
  });

  it('rejects a workflow whose push event is disabled', () => {
    assertTamperRejected(CANONICAL_TEXT.replace('  push:\n', ''), 'вимкнений push event');
  });

  it('rejects a workflow with an extra bypass job', () => {
    assertTamperRejected(
      `${CANONICAL_TEXT}  bypass:
    runs-on: ubuntu-latest
    steps:
      - run: echo "80/80 PASS"
`,
      'доданий bypass job',
    );
  });

  it('rejects a CRLF-only difference because the audit compares exact bytes', () => {
    assertTamperRejected(CANONICAL_TEXT.replace(/\n/g, '\r\n'), 'лише CRLF замість LF');
  });
});

describe('node scripts/audit-submission.mjs', () => {
  let workspace;
  let studentRoot;

  beforeEach(async () => {
    workspace = await realpath(await mkdtemp(join(tmpdir(), 'projecthub-audit-')));
    studentRoot = join(workspace, 'p23-projecthub-teststudent');
  });

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it('reports VALID and exits 0 for the canonical workflow at the expected HEAD', { timeout: AUDIT_TIMEOUT_MS }, async () => {
    const head = await createStudentRepo(studentRoot);
    const result = await runAudit({ studentRoot, expectedSha: head });
    assert.equal(result.code, 0, `stdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
    assert.match(result.stdout, /\bVALID\b/);
  });

  it('rejects a wrong expected 40-character HEAD and exits nonzero', { timeout: AUDIT_TIMEOUT_MS }, async () => {
    const head = await createStudentRepo(studentRoot);
    assert.match(WRONG_SHA, /^[0-9a-f]{40}$/, 'очікуваний SHA мусить бути валідним за формою');
    assert.notEqual(WRONG_SHA, head, 'очікуваний SHA мусить відрізнятися від HEAD');
    const result = await runAudit({ studentRoot, expectedSha: WRONG_SHA });
    assert.notEqual(result.code, 0, 'невідповідний HEAD мусить давати ненульовий код виходу');
    assert.doesNotMatch(result.stdout, /\bVALID\b/);
    assert.notEqual(`${result.stdout}${result.stderr}`.trim(), '', 'відхилення мусить бути пояснене');
  });

  it('rejects a dirty working tree and exits nonzero', { timeout: AUDIT_TIMEOUT_MS }, async () => {
    const head = await createStudentRepo(studentRoot);
    await writeFile(join(studentRoot, 'README.md'), '# ProjectHub\n\nлокальна незакомічена правка\n', 'utf8');
    assert.notEqual(await runGit(['status', '--porcelain'], studentRoot), '', 'фікстура мусить бути справді брудною');
    const result = await runAudit({ studentRoot, expectedSha: head });
    assert.notEqual(result.code, 0, 'брудне робоче дерево мусить давати ненульовий код виходу');
    assert.doesNotMatch(result.stdout, /\bVALID\b/);
    assert.notEqual(`${result.stdout}${result.stderr}`.trim(), '', 'відхилення мусить бути пояснене');
  });
});
