import {Position} from 'vscode-languageserver';

export interface Snippet {
  file: string;
  from: Position;
  to: Position;
  code: string;
  comment: string;
}

export interface Annotation {
  _id: string;
  task: number;
  author: string;
  remark: string;
  points: number;
  snippets: Snippet[];
}

export type AnnotationDto = Omit<Annotation, '_id'>
