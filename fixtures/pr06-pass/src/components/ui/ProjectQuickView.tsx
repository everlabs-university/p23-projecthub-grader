import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';

import type { Project } from '../../features/projects/model';

type ProjectQuickViewProps = {
  project: Project;
};

export default function ProjectQuickView({ project }: ProjectQuickViewProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label={`Quick view ${project.name}`}
          className="button button--ghost"
          type="button"
        >
          Quick view
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="quick-view__overlay" />
        <Dialog.Content className="quick-view__content">
          <div className="quick-view__header">
            <div>
              <p className="quick-view__eyebrow">Project quick view</p>
              <Dialog.Title className="quick-view__title">{project.name}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close quick view"
                className="quick-view__close"
                type="button"
              >
                ×
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="quick-view__summary">
            {project.summary}
          </Dialog.Description>
          <dl className="quick-view__meta">
            <div>
              <dt>Status</dt>
              <dd>{project.status}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{project.owner}</dd>
            </div>
          </dl>
          <Link className="button" to={`/projects/${project.id}`}>
            Open full project
          </Link>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
