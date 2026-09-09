import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import type { Project } from '../features/projects/model';
import {
  projectFormDefaults,
  projectFormSchema,
  projectIdFromName,
  type ProjectFormValues,
} from '../features/projects/projectForm';
import { projectsQuery } from '../features/projects/query';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    defaultValues: projectFormDefaults,
    resolver: zodResolver(projectFormSchema),
  });
  const descriptionLength = watch('description').length;

  const submitProject = (values: ProjectFormValues) => {
    const projectId = projectIdFromName(values.name);

    const project: Project = { id: projectId, ...values };
    queryClient.setQueryData<Project[]>(projectsQuery.queryKey, (projects = []) => [
      ...projects.filter((candidate) => candidate.id !== projectId),
      project,
    ]);

    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="page">
      <p className="backlink">
        <Link to="/projects">← All projects</Link>
      </p>
      <header className="page__header">
        <p className="eyebrow">New catalog entry</p>
        <h1 className="page__title">Create project</h1>
        <p className="page__lead">Add a project with a clear owner, status, and description.</p>
      </header>
      <form
        className="project-form"
        aria-label="Create project"
        onSubmit={handleSubmit(submitProject)}
        noValidate
      >
        <div className="form-field">
          <label htmlFor="project-name">Name</label>
          <input
            id="project-name"
            type="text"
            aria-describedby={errors.name ? 'project-name-error' : undefined}
            aria-invalid={errors.name ? 'true' : 'false'}
            {...register('name')}
          />
          {errors.name ? (
            <p className="form-error" id="project-name-error" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="project-summary">Summary</label>
          <input
            id="project-summary"
            type="text"
            aria-describedby={errors.summary ? 'project-summary-error' : undefined}
            aria-invalid={errors.summary ? 'true' : 'false'}
            {...register('summary')}
          />
          {errors.summary ? (
            <p className="form-error" id="project-summary-error" role="alert">
              {errors.summary.message}
            </p>
          ) : null}
        </div>
        <div className="form-field form-field--wide">
          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            aria-describedby={
              errors.description
                ? 'project-description-count project-description-error'
                : 'project-description-count'
            }
            aria-invalid={errors.description ? 'true' : 'false'}
            {...register('description')}
          />
          <p className="form-count" id="project-description-count">
            {descriptionLength} / 240
          </p>
          {errors.description ? (
            <p className="form-error" id="project-description-error" role="alert">
              {errors.description.message}
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="project-owner">Owner</label>
          <input
            id="project-owner"
            type="text"
            aria-describedby={errors.owner ? 'project-owner-error' : undefined}
            aria-invalid={errors.owner ? 'true' : 'false'}
            {...register('owner')}
          />
          {errors.owner ? (
            <p className="form-error" id="project-owner-error" role="alert">
              {errors.owner.message}
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="project-status">Status</label>
          <select id="project-status" {...register('status')}>
            <option>Planned</option>
            <option>In progress</option>
            <option>On hold</option>
          </select>
        </div>
        <div className="form-actions form-field--wide">
          <button className="button" type="submit">
            Create project
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={() => reset(projectFormDefaults)}
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
