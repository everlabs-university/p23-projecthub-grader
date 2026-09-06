import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderSummary } from '../src/summary.mjs';

const STUDENT_SHA = '9f1c2d3e4a5b60718293a4b5c6d7e8f901234567';
const OTHER_SHA = '00112233445566778899aabbccddeeff00112233';

const PROVISIONAL_SENTENCE =
  'Результат є попереднім до локального повторного прогону канонічного grader на цьому самому SHA.';

const PASSING_LAB = {
  id: 'pr01',
  title: 'Практична №1 — React Router',
  points: 60,
  maxPoints: 80,
  status: 'PASS',
  passedTests: 6,
  totalTests: 8,
};

const FAILING_LAB = {
  id: 'pr02',
  title: 'Практична №2 — Стан застосунку',
  points: 40,
  maxPoints: 80,
  status: 'FAIL',
  passedTests: 4,
  totalTests: 8,
};

function scoreRowsOf(markdown) {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('|') && line.includes('/80'));
}

describe('renderSummary', () => {
  it('renders the ProjectHub heading', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.06.1',
      labScores: [PASSING_LAB],
    });

    assert.match(markdown, /^## ProjectHub — автотести$/m);
  });

  it('records the exact student SHA and the grader version', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.06.1',
      labScores: [PASSING_LAB],
    });

    assert.ok(markdown.includes(STUDENT_SHA), 'summary must contain the student SHA');
    assert.ok(markdown.includes('2026.09.06.1'), 'summary must contain the grader version');
  });

  it('reports the SHA and version it is given rather than fixed values', () => {
    const markdown = renderSummary({
      sha: OTHER_SHA,
      graderVersion: '2026.09.07.2',
      labScores: [FAILING_LAB],
    });

    assert.ok(markdown.includes(OTHER_SHA), 'summary must contain the supplied SHA');
    assert.ok(markdown.includes('2026.09.07.2'), 'summary must contain the supplied grader version');
    assert.equal(markdown.includes(STUDENT_SHA), false);
    assert.equal(markdown.includes('2026.09.06.1'), false);
  });

  it('renders one table row per lab with the score out of 80 and the status', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.06.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.match(markdown, /^\| Практична \| Автотести \| Статус \|$/m);
    assert.match(markdown, /^\| Практична №1 — React Router \| 60\/80 \| PASS \|$/m);
    assert.match(markdown, /^\| Практична №2 — Стан застосунку \| 40\/80 \| FAIL \|$/m);
    assert.equal(scoreRowsOf(markdown).length, 2);
  });

  it('renders exactly one row when a single lab is published', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.06.1',
      labScores: [PASSING_LAB],
    });

    assert.match(markdown, /^\| Практична №1 — React Router \| 60\/80 \| PASS \|$/m);
    assert.equal(scoreRowsOf(markdown).length, 1);
  });

  it('states that the result is provisional until the exact-SHA local audit', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.06.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.ok(
      markdown.includes(PROVISIONAL_SENTENCE),
      'summary must state the result is provisional until the exact-SHA local audit',
    );
  });
});
