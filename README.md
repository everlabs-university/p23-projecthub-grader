# p23-projecthub-grader

Canonical grader for the P-23 ProjectHub React practicals. Every published lab is
scored out of **80 points**. Each rubric weights eight observable behaviours at
10 points each and uses `passPoints: 48`. Scoring is a pure function of the
rubric and the Vitest report, so the same commit always yields the same grade.
The result is rendered as deterministic Markdown for the GitHub step summary
and stays provisional until the canonical grader is re-run locally on the same
SHA.

The `semester-2026` branch currently publishes PR01, PR02, and PR03. Student
pushes run all three practicals cumulatively.

## Layout

| Path | Purpose |
| --- | --- |
| `published.json` | Schema version, grader version, published lab ids. |
| `labs/<labId>/` | Vitest suite plus the `rubric.json` for one lab. |
| `src/run.mjs` | Grading runner: stages the suite, runs Vitest, writes the summary. |
| `scripts/audit-submission.mjs` | Byte-exact audit of a student submission. |
| `canonical/student-grade.yml` | The only workflow a student repository may contain. |
| `fixtures/pr03-pass` | Cumulative known-good repository: PR01, PR02, and PR03 each score 80/80. |
| `fixtures/pr01-fail` | Known-bad repository used to verify partial scoring and failures. |

## Grading a submission

```sh
node src/run.mjs \
  --student-root /absolute/path/to/p23-projecthub-student \
  --sha <40 hex commit id> \
  --summary-file summary.md \
  [--result-file result.json] \
  [--grader-version <version>]
```

The suite is staged in `.projecthub-grader/` inside the student root and removed
on every exit path; the summary is written to the file and to stdout.
When `--result-file` is supplied, the runner also writes the complete
machine-readable score and per-test breakdown as schema-version-1 JSON.

| Exit code | Meaning |
| --- | --- |
| `0` | Every published lab reached its pass mark. |
| `1` | At least one lab scored below its `passPoints`. |
| `2` | Infrastructure failure; nothing was graded. |

## Auditing the exact workflow

The audit compares `.github/workflows/grade.yml` in the student repository with
`canonical/student-grade.yml` byte for byte. It also requires a clean Git work
tree at the exact expected commit.

```sh
node scripts/audit-submission.mjs \
  --student-root /absolute/path/to/p23-projecthub-student \
  --expected-sha <40 hex commit id>
```

## Fixtures and tests

`fixtures/pr03-pass` is the cumulative known-good repository (80/80 for all
three labs). `fixtures/pr01-fail` remains deliberately incomplete: it scores
40/80 in PR01 and 0/80 in PR02 and PR03.

```sh
npm ci
npm test
```

Node.js 22 or newer is required.
