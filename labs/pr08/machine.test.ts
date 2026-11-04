import { createActor } from 'xstate';
import { expect, test } from 'vitest';

import { projectWorkflowMachine } from '@student/features/project-workflow/projectWorkflowMachine';

function actor() {
  return createActor(projectWorkflowMachine).start();
}

test('the workflow starts in draft with clean typed context', () => {
  const workflow = actor();
  const snapshot = workflow.getSnapshot();

  expect(snapshot.matches('draft')).toBe(true);
  expect(snapshot.context).toEqual({ reviewNote: '', feedback: '', revision: 0 });
  workflow.stop();
});

test('editing the review note updates workflow context immutably', () => {
  const workflow = actor();
  const before = workflow.getSnapshot().context;
  workflow.send({ type: 'UPDATE_NOTE', value: 'Ready for a careful review.' });
  const after = workflow.getSnapshot().context;

  expect(after).not.toBe(before);
  expect(after.reviewNote).toBe('Ready for a careful review.');
  expect(after.feedback).toBe('');
  workflow.stop();
});

test('submission is guarded until the review note is meaningful', () => {
  const workflow = actor();
  workflow.send({ type: 'SUBMIT' });
  expect(workflow.getSnapshot().matches('draft')).toBe(true);

  workflow.send({ type: 'UPDATE_NOTE', value: 'too short' });
  workflow.send({ type: 'SUBMIT' });
  expect(workflow.getSnapshot().matches('draft')).toBe(true);

  workflow.send({ type: 'UPDATE_NOTE', value: 'Ready for review now.' });
  workflow.send({ type: 'SUBMIT' });
  expect(workflow.getSnapshot().matches('review')).toBe(true);
  workflow.stop();
});

test('requesting changes returns the workflow to draft with feedback', () => {
  const workflow = actor();
  workflow.send({ type: 'UPDATE_NOTE', value: 'Ready for review now.' });
  workflow.send({ type: 'SUBMIT' });
  workflow.send({ type: 'REQUEST_CHANGES', feedback: 'Clarify the acceptance criteria.' });
  const snapshot = workflow.getSnapshot();

  expect(snapshot.matches('draft')).toBe(true);
  expect(snapshot.context).toEqual({
    reviewNote: '',
    feedback: 'Clarify the acceptance criteria.',
    revision: 1,
  });
  workflow.stop();
});

test('a revised project can be submitted again and approved', () => {
  const workflow = actor();
  workflow.send({ type: 'UPDATE_NOTE', value: 'First review submission.' });
  workflow.send({ type: 'SUBMIT' });
  workflow.send({ type: 'REQUEST_CHANGES', feedback: 'Add an empty state.' });
  workflow.send({ type: 'UPDATE_NOTE', value: 'Added the requested empty state.' });
  workflow.send({ type: 'SUBMIT' });
  workflow.send({ type: 'APPROVE' });
  const snapshot = workflow.getSnapshot();

  expect(snapshot.matches('approved')).toBe(true);
  expect(snapshot.context.revision).toBe(1);
  expect(snapshot.context.feedback).toBe('Add an empty state.');
  workflow.stop();
});
