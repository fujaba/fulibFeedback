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
  task: string;
  _id: string;
  remark: string;
  points: number;
  author: string;
  snippets: Snippet[];
}

export type EvaluationDto = Omit<Evaluation, '_id' | 'assignment' | 'solution'>
