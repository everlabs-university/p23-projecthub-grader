import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const SCHEMA_VERSION = 1;
const MAX_POINTS = 80;

function graderError(code, message) {
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

function isPointValue(value) {
  return Number.isInteger(value) && value >= 0;
}

function formatValue(value) {
  return JSON.stringify(value) ?? String(value);
}

function assertRoot(root) {
  if (!isNonEmptyString(root)) {
    throw graderError(
      'ERR_GRADER_ROOT',
      `Корінь grader має бути непорожнім шляхом, отримано ${formatValue(root)}.`,
    );
  }
}

async function readJson(path, codes) {
  let raw;

  try {
    raw = await readFile(path, 'utf8');
  } catch (cause) {
    if (cause?.code === 'ENOENT') {
      throw graderError(codes.missing, `${codes.subject} відсутній: ${path}`);
    }

    throw graderError(
      codes.unreadable,
      `${codes.subject} неможливо прочитати (${path}): ${cause?.message ?? cause}`,
    );
  }

  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw graderError(
      codes.malformed,
      `${codes.subject} містить некоректний JSON (${path}): ${cause.message}`,
    );
  }
}

/** Читає та валідує published.json у корені grader. */
export async function loadPublished(root) {
  assertRoot(root);

  const path = join(root, 'published.json');
  const subject = 'Файл published.json';
  const manifest = await readJson(path, {
    subject,
    missing: 'ERR_MANIFEST_MISSING',
    unreadable: 'ERR_MANIFEST_UNREADABLE',
    malformed: 'ERR_MANIFEST_MALFORMED_JSON',
  });

  if (!isPlainObject(manifest)) {
    throw graderError('ERR_MANIFEST_SHAPE', `${subject} (${path}) має бути JSON-об'єктом.`);
  }

  if (manifest.schemaVersion !== SCHEMA_VERSION) {
    throw graderError(
      'ERR_MANIFEST_SCHEMA_VERSION',
      `${subject}: schemaVersion має бути ${SCHEMA_VERSION}, отримано ${formatValue(manifest.schemaVersion)}.`,
    );
  }

  if (!isNonEmptyString(manifest.graderVersion)) {
    throw graderError(
      'ERR_MANIFEST_SHAPE',
      `${subject}: graderVersion має бути непорожнім рядком, отримано ${formatValue(manifest.graderVersion)}.`,
    );
  }

  if (!Array.isArray(manifest.labs)) {
    throw graderError(
      'ERR_MANIFEST_SHAPE',
      `${subject}: labs має бути масивом ідентифікаторів практичних, отримано ${formatValue(manifest.labs)}.`,
    );
  }

  const labs = [];
  const seenLabs = new Set();

  for (const [index, labId] of manifest.labs.entries()) {
    if (!isNonEmptyString(labId)) {
      throw graderError(
        'ERR_MANIFEST_SHAPE',
        `${subject}: labs[${index}] має бути непорожнім рядком, отримано ${formatValue(labId)}.`,
      );
    }

    if (seenLabs.has(labId)) {
      throw graderError(
        'ERR_MANIFEST_DUPLICATE_LAB',
        `${subject}: практична «${labId}» вказана в labs більше одного разу.`,
      );
    }

    seenLabs.add(labId);
    labs.push(labId);
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    graderVersion: manifest.graderVersion,
    labs,
  };
}

/** Читає та валідує labs/<labId>/rubric.json у корені grader. */
export async function loadRubric(root, labId) {
  assertRoot(root);

  if (!isNonEmptyString(labId)) {
    throw graderError(
      'ERR_RUBRIC_LAB_ID',
      `Ідентифікатор практичної має бути непорожнім рядком, отримано ${formatValue(labId)}.`,
    );
  }

  const path = join(root, 'labs', labId, 'rubric.json');
  const subject = `Файл rubric практичної «${labId}»`;
  const rubric = await readJson(path, {
    subject,
    missing: 'ERR_RUBRIC_MISSING',
    unreadable: 'ERR_RUBRIC_UNREADABLE',
    malformed: 'ERR_RUBRIC_MALFORMED_JSON',
  });

  if (!isPlainObject(rubric)) {
    throw graderError('ERR_RUBRIC_SHAPE', `${subject} (${path}) має бути JSON-об'єктом.`);
  }

  if (rubric.id !== labId) {
    throw graderError(
      'ERR_RUBRIC_ID_MISMATCH',
      `${subject}: id має дорівнювати «${labId}», отримано ${formatValue(rubric.id)}.`,
    );
  }

  if (!isNonEmptyString(rubric.title)) {
    throw graderError(
      'ERR_RUBRIC_SHAPE',
      `${subject}: title має бути непорожнім рядком, отримано ${formatValue(rubric.title)}.`,
    );
  }

  if (rubric.maxPoints !== MAX_POINTS) {
    throw graderError(
      'ERR_RUBRIC_MAX_POINTS',
      `${subject}: maxPoints має бути рівно ${MAX_POINTS}, отримано ${formatValue(rubric.maxPoints)}.`,
    );
  }

  if (!Array.isArray(rubric.tests) || rubric.tests.length === 0) {
    throw graderError(
      'ERR_RUBRIC_SHAPE',
      `${subject}: tests має бути непорожнім масивом перевірок, отримано ${formatValue(rubric.tests)}.`,
    );
  }

  const tests = [];
  const seenTests = new Set();
  let weightsTotal = 0;

  for (const [index, test] of rubric.tests.entries()) {
    if (!isPlainObject(test)) {
      throw graderError(
        'ERR_RUBRIC_SHAPE',
        `${subject}: tests[${index}] має бути JSON-об'єктом, отримано ${formatValue(test)}.`,
      );
    }

    if (!isNonEmptyString(test.fullName)) {
      throw graderError(
        'ERR_RUBRIC_SHAPE',
        `${subject}: tests[${index}].fullName має бути непорожнім рядком, отримано ${formatValue(test.fullName)}.`,
      );
    }

    if (!isPointValue(test.points)) {
      throw graderError(
        'ERR_RUBRIC_SHAPE',
        `${subject}: tests[${index}].points має бути невід'ємним цілим числом, отримано ${formatValue(test.points)}.`,
      );
    }

    if (seenTests.has(test.fullName)) {
      throw graderError(
        'ERR_RUBRIC_DUPLICATE_TEST',
        `${subject}: перевірка «${test.fullName}» вказана більше одного разу.`,
      );
    }

    seenTests.add(test.fullName);
    weightsTotal += test.points;
    tests.push({ fullName: test.fullName, points: test.points });
  }

  if (weightsTotal !== MAX_POINTS) {
    throw graderError(
      'ERR_RUBRIC_WEIGHTS',
      `${subject}: сума ваг перевірок дорівнює ${weightsTotal}, а має бути рівно ${MAX_POINTS}.`,
    );
  }

  if (
    !Number.isInteger(rubric.passPoints) ||
    rubric.passPoints < 0 ||
    rubric.passPoints > MAX_POINTS
  ) {
    throw graderError(
      'ERR_RUBRIC_PASS_THRESHOLD',
      `${subject}: passPoints має бути цілим числом у межах 0..${MAX_POINTS}, отримано ${formatValue(rubric.passPoints)}.`,
    );
  }

  return {
    id: rubric.id,
    title: rubric.title,
    maxPoints: MAX_POINTS,
    passPoints: rubric.passPoints,
    tests,
  };
}
