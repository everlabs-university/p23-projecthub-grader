const PASSED = 'passed';
const KNOWN_STATUSES = new Set([PASSED, 'failed', 'skipped']);

function scoringError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value) {
  return JSON.stringify(value) ?? String(value);
}

function assertRubric(rubric) {
  if (!isPlainObject(rubric)) {
    throw scoringError(
      'ERR_SCORING_RUBRIC',
      `Rubric має бути об'єктом, отримано ${formatValue(rubric)}.`,
    );
  }

  if (!isNonEmptyString(rubric.id) || !isNonEmptyString(rubric.title)) {
    throw scoringError(
      'ERR_SCORING_RUBRIC',
      'Rubric має містити непорожні рядки id та title.',
    );
  }

  if (!Number.isInteger(rubric.maxPoints) || !Number.isInteger(rubric.passPoints)) {
    throw scoringError(
      'ERR_SCORING_RUBRIC',
      `Rubric «${rubric.id}» має містити цілі maxPoints і passPoints.`,
    );
  }

  if (!Array.isArray(rubric.tests)) {
    throw scoringError(
      'ERR_SCORING_RUBRIC',
      `Rubric «${rubric.id}»: tests має бути масивом, отримано ${formatValue(rubric.tests)}.`,
    );
  }

  for (const [index, test] of rubric.tests.entries()) {
    if (!isPlainObject(test) || !isNonEmptyString(test.fullName) || !Number.isInteger(test.points)) {
      throw scoringError(
        'ERR_SCORING_RUBRIC',
        `Rubric «${rubric.id}»: tests[${index}] має містити непорожній fullName і ціле points.`,
      );
    }
  }
}

function collectPassedByName(assertions) {
  if (!Array.isArray(assertions)) {
    throw scoringError(
      'ERR_SCORING_ASSERTIONS',
      `Результати тестів мають бути масивом, отримано ${formatValue(assertions)}.`,
    );
  }

  const passedByName = new Map();

  for (const [index, assertion] of assertions.entries()) {
    if (!isPlainObject(assertion)) {
      throw scoringError(
        'ERR_SCORING_ASSERTIONS',
        `Результат тесту [${index}] має бути об'єктом, отримано ${formatValue(assertion)}.`,
      );
    }

    if (!isNonEmptyString(assertion.fullName)) {
      throw scoringError(
        'ERR_SCORING_ASSERTIONS',
        `Результат тесту [${index}]: fullName має бути непорожнім рядком, отримано ${formatValue(assertion.fullName)}.`,
      );
    }

    if (!KNOWN_STATUSES.has(assertion.status)) {
      throw scoringError(
        'ERR_SCORING_ASSERTIONS',
        `Результат тесту «${assertion.fullName}»: status має бути passed, failed або skipped, отримано ${formatValue(assertion.status)}.`,
      );
    }

    const passed = assertion.status === PASSED;
    const previous = passedByName.get(assertion.fullName);
    passedByName.set(assertion.fullName, previous === undefined ? passed : previous && passed);
  }

  return passedByName;
}

/** Чистий підрахунок балів однієї практичної; inputs не змінюються. */
export function scoreLab(rubric, assertions) {
  assertRubric(rubric);

  const passedByName = collectPassedByName(assertions);

  let points = 0;
  let passedTests = 0;

  for (const test of rubric.tests) {
    if (passedByName.get(test.fullName) !== true) {
      continue;
    }

    points += test.points;
    passedTests += 1;
  }

  return {
    id: rubric.id,
    title: rubric.title,
    points,
    maxPoints: rubric.maxPoints,
    status: points >= rubric.passPoints ? 'PASS' : 'FAIL',
    passedTests,
    totalTests: rubric.tests.length,
  };
}
