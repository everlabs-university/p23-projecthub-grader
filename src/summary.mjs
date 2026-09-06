const HEADING = '## ProjectHub — автотести';
const TABLE_HEADER = '| Практична | Автотести | Статус |';
const TABLE_DIVIDER = '| --- | --- | --- |';
const PROVISIONAL_NOTE =
  'Результат є попереднім до локального повторного прогону канонічного grader на цьому самому SHA.';
const KNOWN_STATUSES = new Set(['PASS', 'FAIL']);

function summaryError(message) {
  const error = new Error(message);
  error.code = 'ERR_SUMMARY_INPUT';
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

function escapeCell(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replace(/\r\n|\r|\n/g, ' ');
}

function renderRow(labScore, index) {
  if (!isPlainObject(labScore)) {
    throw summaryError(
      `labScores[${index}] має бути об'єктом, отримано ${formatValue(labScore)}.`,
    );
  }

  if (!isNonEmptyString(labScore.title)) {
    throw summaryError(
      `labScores[${index}].title має бути непорожнім рядком, отримано ${formatValue(labScore.title)}.`,
    );
  }

  if (!Number.isInteger(labScore.points) || !Number.isInteger(labScore.maxPoints)) {
    throw summaryError(
      `labScores[${index}] має містити цілі points і maxPoints.`,
    );
  }

  if (!KNOWN_STATUSES.has(labScore.status)) {
    throw summaryError(
      `labScores[${index}].status має бути PASS або FAIL, отримано ${formatValue(labScore.status)}.`,
    );
  }

  return `| ${escapeCell(labScore.title)} | ${labScore.points}/${labScore.maxPoints} | ${labScore.status} |`;
}

/** Будує детермінований Markdown для GitHub step summary. */
export function renderSummary(input) {
  if (!isPlainObject(input)) {
    throw summaryError(
      `Аргумент renderSummary має бути об'єктом, отримано ${formatValue(input)}.`,
    );
  }

  const { sha, graderVersion, labScores } = input;

  if (!isNonEmptyString(sha)) {
    throw summaryError(`sha має бути непорожнім рядком, отримано ${formatValue(sha)}.`);
  }

  if (!isNonEmptyString(graderVersion)) {
    throw summaryError(
      `graderVersion має бути непорожнім рядком, отримано ${formatValue(graderVersion)}.`,
    );
  }

  if (!Array.isArray(labScores)) {
    throw summaryError(`labScores має бути масивом, отримано ${formatValue(labScores)}.`);
  }

  return [
    HEADING,
    '',
    `- Commit студента: \`${sha}\``,
    `- Версія grader: \`${graderVersion}\``,
    '',
    TABLE_HEADER,
    TABLE_DIVIDER,
    ...labScores.map(renderRow),
    '',
    PROVISIONAL_NOTE,
    '',
  ].join('\n');
}
