import axios, {AxiosRequestConfig, Method} from 'axios';
import {Observable} from 'rxjs';
import {Config} from '../config/config';
import {Assignment, Task} from './assignment';
import {Evaluation} from './evaluation';
import {CreateSelectionDto, SelectionDto} from './selection';
import {Solution} from './solution';
import {default as EventSource} from 'eventsource';

export class AssignmentsApiService {
  async getContext(config: Config, uri: string) {
    if (!config.apiServer || !config.assignment.id) {
      return {};
    }

    const assignment = await this.getAssignment(config);
    if (!assignment) {
      return {};
    }

    const prefix = assignment.classroom.prefix;
    if (prefix) {
      const {file, username} = this.getFileAndGithub(prefix, uri);
      const solution = await this.getSolution(config, undefined, username);
      return {assignment, solution, file};
    } else {
      const pathComponents = uri.split('/');
      const matches = pathComponents.filter(p => /[0-9]/.test(p) && /^[a-zA-Z0-9_.-]+$/.test(p));
      const search = 'studentId:' + matches.join('|');
      const solution = await this.getSolution(config, search);
      if (!solution) {
        return {};
      }
      const studentId = solution.author.studentId;
      const startIndex = uri.indexOf(studentId);
      if (startIndex < 0) {
        return {};
      }
      const file = uri.substring(startIndex + studentId.length + 1);
      return {assignment, solution, file};
    }
  }

  private getFileAndGithub(prefix: string, uri: string) {
    const prefixIndex = uri.indexOf(prefix);
    // This works for prefix-Student/ as well as prefix/Student/
    const usernameStart = prefixIndex + prefix.length + 1;
    const usernameEnd = uri.indexOf('/', usernameStart);
    const username = uri.substring(usernameStart, usernameEnd);
    const file = uri.substring(usernameEnd + 1);
    return {username, file};
  }

  findTasks(tasks: Task[], id: string): Task[] {
    for (const task of tasks) {
      if (task._id === id) {
        return [task];
      }
      const subTask = this.findTasks(task.children, id);
      if (subTask.length) {
        return [task, ...subTask];
      }
    }
    return [];
  }

  async getAssignment(config: Config): Promise<Assignment | undefined> {
    return this.http<Assignment>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}`, undefined, {
      headers: this.getHeaders(config),
    }).catch(() => undefined);
  }

  async getSolution(config: Config, q?: string, github?: string): Promise<Solution | undefined> {
    if (config.solution.id) {
      return this.http<Solution>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${config.solution.id}`, undefined, {
        headers: this.getHeaders(config),
      }).catch(() => undefined);
    }

    return this.http<Solution[]>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions`, undefined, {
      params: {
        q,
        'author.github': github,
      },
      headers: this.getHeaders(config),
    }).then(([solution]) => solution, () => undefined);
  }

  async getEvaluations(config: Config, solution: string, params?: { task?: string, file?: string }): Promise<Evaluation[]> {
    return this.http<Evaluation[]>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/evaluations`, undefined, {
      params,
      headers: this.getHeaders(config),
    }).catch(() => []);
  }

  streamEvaluations(config: Config, solution: string): Observable<{ event: string, evaluation: Evaluation }> {
    const {apiServer, assignment: {id, token}} = config;
    const url = `${apiServer}/api/v1/assignments/${id}/solutions/${solution}/evaluations/events?token=${token}`;
    return new Observable(observer => {
      const eventSource = new EventSource(url);
      eventSource.onmessage = event => observer.next(JSON.parse(event.data));
      eventSource.onerror = event => observer.error(event);
      return () => eventSource.close();
    });
  }

  async setSelection(config: Config, solution: string, dto: CreateSelectionDto): Promise<SelectionDto> {
    return this.http<SelectionDto>('POST', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/selections`, dto, {
      headers: this.getHeaders(config),
    });
  }

  private async http<T>(method: Method, url: string, body?: any, options?: AxiosRequestConfig): Promise<T> {
    try {
      const {data} = await axios.request({
        ...options,
        method,
        url,
        data: body,
      });
      return data;
    } catch (error: any) {
      console.error(method, url, 'Error:', error.message, error.response?.data);
      throw error;
    }
  }

  private getHeaders(config: Config): any {
    const result: Record<string, string> = {};
    if (config.assignment.token) {
      result['Assignment-Token'] = config.assignment.token;
    }
    if (config.solution.token) {
      result['Solution-Token'] = config.solution.token;
    }
    return result;
  }
}
