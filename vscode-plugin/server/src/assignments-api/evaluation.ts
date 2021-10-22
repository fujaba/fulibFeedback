import {Position} from 'vscode-languageserver';

export interface Snippet {
  file: string;
  from: Position;
  to: Position;
  code: string;
  comment: string;
}

export interface Evaluation {
  assignment: string;
  solution: string;
  _id: string;
  task: string;
  author: string;
  points: number;
  snippets: Snippet[];
}

export type EvaluationDto = Omit<Evaluation, '_id' | 'assignment' | 'solution'>
