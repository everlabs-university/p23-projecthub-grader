import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { renderSummary } from '../src/summary.mjs';

const STUDENT_SHA = '9f1c2d3e4a5b60718293a4b5c6d7e8f901234567';
const OTHER_SHA = '00112233445566778899aabbccddeeff00112233';

const PROVISIONAL_SENTENCE =
  'This result is provisional until the canonical grader is re-run locally on the same SHA.';

const PASSING_LAB = {
  id: 'pr01',
  title: 'Practical 1 — React Router',
  points: 60,
  maxPoints: 80,
  status: 'PASS',
  passedTests: 6,
  totalTests: 8,
  tests: [
    { fullName: 'home route renders', points: 10, awarded: 10, status: 'passed' },
    { fullName: 'unknown route renders not found', points: 10, awarded: 0, status: 'failed' },
  ],
};

const FAILING_LAB = {
  id: 'pr02',
  title: 'Practical 2 — Application state',
  points: 40,
  maxPoints: 80,
  status: 'FAIL',
  passedTests: 4,
  totalTests: 8,
  tests: [
    { fullName: 'workspace defaults render', points: 10, awarded: 10, status: 'passed' },
    { fullName: 'workspace reset works', points: 10, awarded: 0, status: 'missing' },
  ],
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
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB],
    });

    assert.match(markdown, /^## ProjectHub automatic tests$/m);
  });

  it('records the exact student SHA and the grader version', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB],
    });

    assert.ok(markdown.includes(STUDENT_SHA), 'summary must contain the student SHA');
    assert.ok(markdown.includes('2026.09.07.1'), 'summary must contain the grader version');
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
    assert.equal(markdown.includes('2026.09.07.1'), false);
  });

  it('renders one table row per lab with the score out of 80 and the status', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.match(markdown, /^\| Practical \| Automatic tests \| Status \|$/m);
    assert.match(markdown, /^\| Practical 1 — React Router \| 60\/80 \| PASS \|$/m);
    assert.match(markdown, /^\| Practical 2 — Application state \| 40\/80 \| FAIL \|$/m);
    assert.equal(scoreRowsOf(markdown).length, 2);
  });

  it('renders exactly one row when a single lab is published', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB],
    });

    assert.match(markdown, /^\| Practical 1 — React Router \| 60\/80 \| PASS \|$/m);
    assert.equal(scoreRowsOf(markdown).length, 1);
  });

  it('renders a public per-check breakdown for every practical', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.match(markdown, /^### Practical 1 — React Router — 60\/80 PASS$/m);
    assert.match(markdown, /^\| Check \| Points \| Result \|$/m);
    assert.match(markdown, /^\| home route renders \| 10\/10 \| PASS \|$/m);
    assert.match(markdown, /^\| unknown route renders not found \| 0\/10 \| FAIL \|$/m);
    assert.match(markdown, /^### Practical 2 — Application state — 40\/80 FAIL$/m);
    assert.match(markdown, /^\| workspace reset works \| 0\/10 \| FAIL \|$/m);
  });

  it('explains that a red workflow is a grading result rather than a grader crash', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.match(
      markdown,
      /> Grading completed\. A red workflow means at least one published practical is below the pass score; the grader itself did not crash\./,
    );
  });

  it('states that the result is provisional until the exact-SHA local audit', () => {
    const markdown = renderSummary({
      sha: STUDENT_SHA,
      graderVersion: '2026.09.07.1',
      labScores: [PASSING_LAB, FAILING_LAB],
    });

    assert.ok(
      markdown.includes(PROVISIONAL_SENTENCE),
      'summary must state the result is provisional until the exact-SHA local audit',
    );
  });
});
