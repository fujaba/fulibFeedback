import {Snippet} from './evaluation';

export interface SelectionDto {
  assignment: string;
  solution: string;
  author: string;
  snippet: Snippet;
}

export type CreateSelectionDto = Omit<SelectionDto, 'assignment' | 'solution'>;
