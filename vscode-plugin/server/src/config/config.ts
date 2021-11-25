export interface Config {
  maxNumberOfProblems: number;
  user: {
    name: string;
  };
  assignment: {
    id: string;
    token: string;
  };
  solution: {
    id: string;
    token: string;
  };
  apiServer: string;
  codeSearch: boolean;
}
