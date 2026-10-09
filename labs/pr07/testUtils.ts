import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { expect } from 'vitest';

const studentRoot = process.cwd();

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

export function packageJson() {
  return JSON.parse(readFileSync(join(studentRoot, 'package.json'), 'utf8'));
}

export function studentTests() {
  return walk(join(studentRoot, 'src')).map((path) => ({
    path: relative(studentRoot, path).replaceAll('\\', '/'),
    source: readFileSync(path, 'utf8'),
  }));
}

export function sourcesNamed(pattern: RegExp) {
  return studentTests().filter((file) => pattern.test(file.path));
}

export function combined(pattern = /./) {
  return sourcesNamed(pattern).map((file) => file.source).join('\n');
}

export function expectPatterns(source: string, patterns: RegExp[]) {
  for (const pattern of patterns) expect(source).toMatch(pattern);
}
