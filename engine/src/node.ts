export interface Node {
  declaration: string;
  parent?: Node;
  children: Node[];
  start: number;
  end: number;
}
