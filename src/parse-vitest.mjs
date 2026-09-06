const PASSED = 'passed';
const FAILED = 'failed';
const SKIPPED = 'skipped';

function parseError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function formatValue(value) {
  return JSON.stringify(value) ?? String(value);
}

function normaliseStatus(status) {
  if (status === PASSED) return PASSED;
  if (status === FAILED) return FAILED;
  return SKIPPED;
}

function describeFile(file, index) {
  return isNonEmptyString(file.name) ? file.name : `testResults[${index}]`;
}

export function parseVitestJson(raw) {
  if (typeof raw !== 'string') {
    throw parseError('ERR_VITEST_JSON_MALFORMED', `Звіт Vitest має бути рядком JSON, отримано ${formatValue(raw)}.`);
  }

  let report;
  try {
    report = JSON.parse(raw);
  } catch (cause) {
    throw parseError('ERR_VITEST_JSON_MALFORMED', `Звіт Vitest містить некоректний JSON: ${cause.message}`);
  }

  if (!isPlainObject(report)) {
    throw parseError('ERR_VITEST_JSON_SHAPE', `Звіт Vitest має бути JSON-об'єктом, отримано ${formatValue(report)}.`);
  }
  if (!Array.isArray(report.testResults)) {
    throw parseError('ERR_VITEST_JSON_SHAPE', `Звіт Vitest: testResults має бути масивом, отримано ${formatValue(report.testResults)}.`);
  }

  const assertions = [];
  for (const [fileIndex, file] of report.testResults.entries()) {
    if (!isPlainObject(file)) {
      throw parseError('ERR_VITEST_JSON_SHAPE', `Звіт Vitest: testResults[${fileIndex}] має бути JSON-об'єктом, отримано ${formatValue(file)}.`);
    }
    const fileName = describeFile(file, fileIndex);
    if (!Array.isArray(file.assertionResults)) {
      throw parseError('ERR_VITEST_JSON_SHAPE', `Звіт Vitest (${fileName}): assertionResults має бути масивом, отримано ${formatValue(file.assertionResults)}.`);
    }
    for (const [index, assertion] of file.assertionResults.entries()) {
      if (!isPlainObject(assertion) || !isNonEmptyString(assertion.fullName)) {
        throw parseError('ERR_VITEST_JSON_SHAPE', `Звіт Vitest (${fileName}): assertionResults[${index}].fullName має бути непорожнім рядком, отримано ${formatValue(assertion?.fullName)}.`);
      }
      assertions.push({ fullName: assertion.fullName, status: normaliseStatus(assertion.status) });
    }
  }

  return assertions;
}
