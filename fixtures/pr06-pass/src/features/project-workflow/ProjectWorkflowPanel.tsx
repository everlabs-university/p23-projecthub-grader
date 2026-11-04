import { useState } from 'react';
import { useMachine } from '@xstate/react';

import { projectWorkflowMachine } from './projectWorkflowMachine';

type ProjectWorkflowPanelProps = {
  projectId: string;
  projectName: string;
};

const LABELS = {
  draft: 'Draft',
  review: 'In review',
  approved: 'Approved',
} as const;

export function ProjectWorkflowPanel({ projectId, projectName }: ProjectWorkflowPanelProps) {
  const [snapshot, send] = useMachine(projectWorkflowMachine);
  const [changeRequest, setChangeRequest] = useState('');
  const state = snapshot.value as keyof typeof LABELS;

  return (
    <section aria-labelledby={`workflow-${projectId}`}>
      <h2 id={`workflow-${projectId}`}>Workflow for {projectName}</h2>
      <p role="status" aria-live="polite">Status: {LABELS[state]}</p>

      {snapshot.context.feedback && <p>Latest feedback: {snapshot.context.feedback}</p>}

      {snapshot.matches('draft') && (
        <>
          <label htmlFor={`review-note-${projectId}`}>Review note</label>
          <textarea
            id={`review-note-${projectId}`}
            value={snapshot.context.reviewNote}
            onChange={(event) => send({ type: 'UPDATE_NOTE', value: event.target.value })}
          />
          <button type="button" onClick={() => send({ type: 'SUBMIT' })}>Submit for review</button>
        </>
      )}

      {snapshot.matches('review') && (
        <>
          <p>Review note: {snapshot.context.reviewNote}</p>
          <label htmlFor={`change-request-${projectId}`}>Change request</label>
          <textarea
            id={`change-request-${projectId}`}
            value={changeRequest}
            onChange={(event) => setChangeRequest(event.target.value)}
          />
          <button
            type="button"
            onClick={() => send({ type: 'REQUEST_CHANGES', feedback: changeRequest })}
          >
            Request changes
          </button>
          <button type="button" onClick={() => send({ type: 'APPROVE' })}>Approve</button>
        </>
      )}
    </section>
  );
}
