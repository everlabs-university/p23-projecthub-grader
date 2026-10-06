export type Project = {
  id: string;
  name: string;
  summary: string;
  description: string;
  owner: string;
  status: 'In progress' | 'On hold' | 'Planned';
};
