import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {AxiosRequestConfig, Method} from 'axios';
import {firstValueFrom, Observable} from 'rxjs';
import {Config} from '../config/config';
import {Assignment, Task} from './assignment';
import {Evaluation} from './evaluation';
import {CreateSelectionDto, SelectionDto} from './selection';
import {Solution} from './solution';
import * as EventSource from 'eventsource';

@Injectable()
export class AssignmentsApiService {
  constructor(
    private httpService: HttpService,
  ) {
  }

  async getContext(config: Config, uri: string) {
    if (!config.apiServer || !config.assignment.id) {
      return {};
    }

    const assignment = await this.getAssignment(config);
    if (!assignment) {
      return {};
    }

    const {username, file} = await this.getFileAndGithub(assignment, uri);
    const solution = await this.getSolution(config, username);
    return {assignment, solution, file};
  }

  private async getFileAndGithub(assignment: Assignment, uri: string) {
    const prefix = assignment.classroom.prefix;
    const prefixIndex = uri.indexOf(prefix);
    // This works for prefix-Student/ as well as prefix/Student/
    const usernameStart = prefixIndex + prefix.length + 1;
    const usernameEnd = uri.indexOf('/', usernameStart);
    const username = uri.substring(usernameStart, usernameEnd);
    const file = uri.substring(usernameEnd + 1);
    return {username, file};
  }

  findTask(tasks: Task[], id: string): Task | undefined {
    for (const task of tasks) {
      if (task._id === id) {
        return task;
      }
      const subTask = this.findTask(task.children, id);
      if (subTask) {
        return subTask;
      }
    }
    return undefined;
  }

  async getAssignment(config: Config): Promise<Assignment | undefined> {
    return this.http<Assignment>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}`, undefined, {
      headers: this.getHeaders(config),
    }).catch(() => undefined);
  }

  async getSolution(config: Config, github: string): Promise<Solution | undefined> {
    if (config.solution.id) {
      return this.http<Solution>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${config.solution.id}`, undefined, {
        headers: this.getHeaders(config),
      }).catch(() => undefined);
    }

    const all = await this.http<Solution[]>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions`, undefined, {
      params: {
        'author.github': github,
      },
      headers: this.getHeaders(config),
    });
    return all[0];
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
      const {data} = await firstValueFrom(this.httpService.request({
        ...options,
        method,
        url,
        data: body,
      }));
      return data;
    } catch (error: any) {
      console.error(error.message, error.response?.data);
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
