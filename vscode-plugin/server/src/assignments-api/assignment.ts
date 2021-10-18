export interface Task {
  _id: string;
  description: string;
  points: number;
}

export interface Assignment {
  _id: string;
  classroom: {
    prefix: string;
  };
  tasks: Task[];
}
