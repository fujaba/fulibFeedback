export interface Task {
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
