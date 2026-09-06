import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadPublished, loadRubric } from '../src/manifest.mjs';

const GRADER_ROOT = fileURLToPath(new URL('..', import.meta.url));

const PR01_BEHAVIOURS = [
  '/ показує головну сторінку ProjectHub',
  '/projects показує список проєктів',
  '/projects/:projectId показує сторінку конкретного проєкту',
  'невідомий URL показує сторінку 404',
  'навігація через UI змінює маршрут без повного reload',
  'прямий перехід на detail route працює',
  'відсутній projectId обробляється контрольовано',
  'базові посилання мають доступні назви',
];

async function writePublished(root, text) {
  await writeFile(join(root, 'published.json'), text, 'utf8');
}

async function writeRubric(root, labId, text) {
  await mkdir(join(root, 'labs', labId), { recursive: true });
  await writeFile(join(root, 'labs', labId, 'rubric.json'), text, 'utf8');
}

describe('shipped grader manifest', () => {
  it('loads published.json with the pilot grader version and pr01 only', async () => {
    assert.deepStrictEqual(await loadPublished(GRADER_ROOT), {
      schemaVersion: 1,
      graderVersion: '2026.09.06.1',
      labs: ['pr01'],
    });
  });

  it('loads the pr01 rubric as eight ten-point behaviours totalling 80 with a 48 pass mark', async () => {
    const rubric = await loadRubric(GRADER_ROOT, 'pr01');

    assert.equal(rubric.id, 'pr01');
    assert.equal(rubric.title, 'Практична №1 — React Router');
    assert.equal(rubric.maxPoints, 80);
    assert.equal(rubric.passPoints, 48);
    assert.deepStrictEqual(
      rubric.tests.map((entry) => entry.fullName),
      PR01_BEHAVIOURS,
    );
    assert.deepStrictEqual(
      rubric.tests.map((entry) => entry.points),
      [10, 10, 10, 10, 10, 10, 10, 10],
    );
  });

  it('has a rubric for every published lab', async () => {
    const published = await loadPublished(GRADER_ROOT);

    for (const labId of published.labs) {
      const rubric = await loadRubric(GRADER_ROOT, labId);
      assert.equal(rubric.id, labId);
    }
  });
});

describe('manifest validation', () => {
  let workspace;

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'projecthub-manifest-'));
  });

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true });
  });

  it('rejects duplicate lab ids in published.json', async () => {
    await writePublished(
      workspace,
      `{
  "schemaVersion": 1,
  "graderVersion": "2026.09.06.1",
  "labs": ["pr01", "pr02", "pr01"]
}
`,
    );

    await assert.rejects(
      () => loadPublished(workspace),
      (error) => {
        assert.equal(error.code, 'ERR_MANIFEST_DUPLICATE_LAB');
        assert.match(error.message, /pr01/);
        return true;
      },
    );
  });

  it('rejects a rubric whose test weights do not total 80', async () => {
    await writeRubric(
      workspace,
      'pr01',
      `{
  "id": "pr01",
  "title": "Практична №1 — React Router",
  "maxPoints": 80,
  "passPoints": 48,
  "tests": [
    { "fullName": "перша поведінка", "points": 40 },
    { "fullName": "друга поведінка", "points": 30 }
  ]
}
`,
    );

    await assert.rejects(
      () => loadRubric(workspace, 'pr01'),
      (error) => {
        assert.equal(error.code, 'ERR_RUBRIC_WEIGHTS');
        assert.match(error.message, /70/);
        assert.match(error.message, /80/);
        return true;
      },
    );
  });

  it('rejects a pass threshold above 80', async () => {
    await writeRubric(
      workspace,
      'pr01',
      `{
  "id": "pr01",
  "title": "Практична №1 — React Router",
  "maxPoints": 80,
  "passPoints": 96,
  "tests": [
    { "fullName": "перша поведінка", "points": 40 },
    { "fullName": "друга поведінка", "points": 40 }
  ]
}
`,
    );

    await assert.rejects(
      () => loadRubric(workspace, 'pr01'),
      (error) => {
        assert.equal(error.code, 'ERR_RUBRIC_PASS_THRESHOLD');
        assert.match(error.message, /96/);
        return true;
      },
    );
  });

  it('rejects a negative pass threshold', async () => {
    await writeRubric(
      workspace,
      'pr01',
      `{
  "id": "pr01",
  "title": "Практична №1 — React Router",
  "maxPoints": 80,
  "passPoints": -1,
  "tests": [
    { "fullName": "перша поведінка", "points": 40 },
    { "fullName": "друга поведінка", "points": 40 }
  ]
}
`,
    );

    await assert.rejects(
      () => loadRubric(workspace, 'pr01'),
      (error) => {
        assert.equal(error.code, 'ERR_RUBRIC_PASS_THRESHOLD');
        assert.match(error.message, /-1/);
        return true;
      },
    );
  });

  it('rejects a rubric with a duplicate test fullName', async () => {
    await writeRubric(
      workspace,
      'pr01',
      `{
  "id": "pr01",
  "title": "Практична №1 — React Router",
  "maxPoints": 80,
  "passPoints": 48,
  "tests": [
    { "fullName": "однакова назва", "points": 40 },
    { "fullName": "однакова назва", "points": 40 }
  ]
}
`,
    );

    await assert.rejects(
      () => loadRubric(workspace, 'pr01'),
      (error) => {
        assert.equal(error.code, 'ERR_RUBRIC_DUPLICATE_TEST');
        assert.match(error.message, /однакова назва/);
        return true;
      },
    );
  });

  it('rejects a published lab that has no rubric file', async () => {
    await writePublished(
      workspace,
      `{
  "schemaVersion": 1,
  "graderVersion": "2026.09.06.1",
  "labs": ["pr01", "pr02"]
}
`,
    );
    await writeRubric(
      workspace,
      'pr01',
      `{
  "id": "pr01",
  "title": "Практична №1 — React Router",
  "maxPoints": 80,
  "passPoints": 48,
  "tests": [
    { "fullName": "перша поведінка", "points": 40 },
    { "fullName": "друга поведінка", "points": 40 }
  ]
}
`,
    );

    assert.deepStrictEqual(await loadPublished(workspace), {
      schemaVersion: 1,
      graderVersion: '2026.09.06.1',
      labs: ['pr01', 'pr02'],
    });

    await assert.rejects(
      () => loadRubric(workspace, 'pr02'),
      (error) => {
        assert.equal(error.code, 'ERR_RUBRIC_MISSING');
        assert.match(error.message, /pr02/);
        return true;
      },
    );
  });
});
