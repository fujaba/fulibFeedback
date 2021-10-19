export interface Task {
  _id: string;
  description: string;
  points: number;
  children: Task[];
}

export interface Assignment {
  _id: string;
  classroom: {
    prefix: string;
  };
  tasks: Task[];
}
