import { assign, setup } from 'xstate';

export type ProjectWorkflowContext = {
  reviewNote: string;
  feedback: string;
  revision: number;
};

export type ProjectWorkflowEvent =
  | { type: 'UPDATE_NOTE'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'REQUEST_CHANGES'; feedback: string }
  | { type: 'APPROVE' };

export const projectWorkflowMachine = setup({
  types: {
    context: {} as ProjectWorkflowContext,
    events: {} as ProjectWorkflowEvent,
  },
  guards: {
    hasMeaningfulReviewNote: ({ context }) => context.reviewNote.trim().length >= 10,
  },
  actions: {
    updateReviewNote: assign({
      reviewNote: ({ event }) => event.type === 'UPDATE_NOTE' ? event.value : '',
    }),
    recordChangeRequest: assign(({ context, event }) => {
      if (event.type !== 'REQUEST_CHANGES') return {};
      return {
        feedback: event.feedback.trim(),
        reviewNote: '',
        revision: context.revision + 1,
      };
    }),
  },
}).createMachine({
  id: 'projectWorkflow',
  initial: 'draft',
  context: { reviewNote: '', feedback: '', revision: 0 },
  states: {
    draft: {
      on: {
        UPDATE_NOTE: { actions: 'updateReviewNote' },
        SUBMIT: { guard: 'hasMeaningfulReviewNote', target: 'review' },
      },
    },
    review: {
      on: {
        REQUEST_CHANGES: { actions: 'recordChangeRequest', target: 'draft' },
        APPROVE: { target: 'approved' },
      },
    },
    approved: { type: 'final' },
  },
});
