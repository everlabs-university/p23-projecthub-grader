import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  summary: z.string().trim().min(10, 'Summary must be at least 10 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(240, 'Description must be at most 240 characters'),
  owner: z.string().trim().min(2, 'Owner must be at least 2 characters'),
  status: z.enum(['Planned', 'In progress', 'On hold']),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectFormDefaults: ProjectFormValues = {
  name: '',
  summary: '',
  description: '',
  owner: '',
  status: 'Planned',
};

export function projectIdFromName(name: string): string {
  return name
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '');
}
