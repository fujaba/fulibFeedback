import {Position} from 'vscode-languageserver';

export interface Snippet {
  file: string;
  from: Position;
  to: Position;
  code: string;
  comment: string;
}

export interface CodeSearchInfo {
  origin?: string;
  created?: number;
  updated?: number;
  deleted?: number;
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
  codeSearch?: CodeSearchInfo;
}

export interface EvaluationDto extends Omit<Evaluation, '_id' | 'assignment' | 'solution' | 'codeSearch'> {
  codeSearch?: boolean;
}
