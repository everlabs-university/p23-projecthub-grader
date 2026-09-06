import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { scoreLab } from '../src/scoring.mjs';

const HOME = '/ показує головну сторінку ProjectHub';
const LIST = '/projects показує список проєктів';
const DETAIL = '/projects/:projectId показує сторінку конкретного проєкту';
const NOT_FOUND = 'невідомий URL показує сторінку 404';
const CLIENT_NAV = 'навігація через UI змінює маршрут без повного reload';
const DIRECT_ENTRY = 'прямий перехід на detail route працює';
const MISSING_ID = 'відсутній projectId обробляється контрольовано';
const A11Y_LINKS = 'базові посилання мають доступні назви';

const PR01_RUBRIC = {
  id: 'pr01',
  title: 'Практична №1 — React Router',
  maxPoints: 80,
  passPoints: 48,
  tests: [
    { fullName: HOME, points: 10 },
    { fullName: LIST, points: 10 },
    { fullName: DETAIL, points: 10 },
    { fullName: NOT_FOUND, points: 10 },
    { fullName: CLIENT_NAV, points: 10 },
    { fullName: DIRECT_ENTRY, points: 10 },
    { fullName: MISSING_ID, points: 10 },
    { fullName: A11Y_LINKS, points: 10 },
  ],
};

describe('scoreLab', () => {
  it('awards 80/80 and PASS when all eight behaviours pass', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
      { fullName: NOT_FOUND, status: 'passed' },
      { fullName: CLIENT_NAV, status: 'passed' },
      { fullName: DIRECT_ENTRY, status: 'passed' },
      { fullName: MISSING_ID, status: 'passed' },
      { fullName: A11Y_LINKS, status: 'passed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 80,
      maxPoints: 80,
      status: 'PASS',
      passedTests: 8,
      totalTests: 8,
    });
  });

  it('awards 50/80 and PASS when five of eight behaviours pass', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
      { fullName: NOT_FOUND, status: 'passed' },
      { fullName: CLIENT_NAV, status: 'passed' },
      { fullName: DIRECT_ENTRY, status: 'failed' },
      { fullName: MISSING_ID, status: 'failed' },
      { fullName: A11Y_LINKS, status: 'failed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 50,
      maxPoints: 80,
      status: 'PASS',
      passedTests: 5,
      totalTests: 8,
    });
  });

  it('awards 40/80 and FAIL when four of eight behaviours pass', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
      { fullName: NOT_FOUND, status: 'passed' },
      { fullName: CLIENT_NAV, status: 'failed' },
      { fullName: DIRECT_ENTRY, status: 'failed' },
      { fullName: MISSING_ID, status: 'failed' },
      { fullName: A11Y_LINKS, status: 'failed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 40,
      maxPoints: 80,
      status: 'FAIL',
      passedTests: 4,
      totalTests: 8,
    });
  });

  it('awards zero points for a skipped behaviour', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
      { fullName: NOT_FOUND, status: 'passed' },
      { fullName: CLIENT_NAV, status: 'passed' },
      { fullName: DIRECT_ENTRY, status: 'passed' },
      { fullName: MISSING_ID, status: 'skipped' },
      { fullName: A11Y_LINKS, status: 'passed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 70,
      maxPoints: 80,
      status: 'PASS',
      passedTests: 7,
      totalTests: 8,
    });
  });

  it('ignores passing assertions that are not in the rubric', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
      { fullName: NOT_FOUND, status: 'passed' },
      { fullName: CLIENT_NAV, status: 'failed' },
      { fullName: DIRECT_ENTRY, status: 'failed' },
      { fullName: MISSING_ID, status: 'failed' },
      { fullName: A11Y_LINKS, status: 'failed' },
      { fullName: 'зайвий тест поза rubric #1', status: 'passed' },
      { fullName: 'зайвий тест поза rubric #2', status: 'passed' },
      { fullName: 'зайвий тест поза rubric #3', status: 'passed' },
      { fullName: 'зайвий тест поза rubric #4', status: 'passed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 40,
      maxPoints: 80,
      status: 'FAIL',
      passedTests: 4,
      totalTests: 8,
    });
  });

  it('awards zero points for a rubric behaviour absent from the assertions', () => {
    const score = scoreLab(PR01_RUBRIC, [
      { fullName: HOME, status: 'passed' },
      { fullName: LIST, status: 'passed' },
      { fullName: DETAIL, status: 'passed' },
    ]);

    assert.deepStrictEqual(score, {
      id: 'pr01',
      title: 'Практична №1 — React Router',
      points: 30,
      maxPoints: 80,
      status: 'FAIL',
      passedTests: 3,
      totalTests: 8,
    });
  });
});
