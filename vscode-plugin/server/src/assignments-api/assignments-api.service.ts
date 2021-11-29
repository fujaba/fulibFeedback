import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {AxiosRequestConfig, Method} from 'axios';
import {firstValueFrom} from 'rxjs';
import {Config} from '../config/config';
import {Assignment, Task} from './assignment';
import {Evaluation} from './evaluation';
import {CreateSelectionDto, SelectionDto} from './selection';
import {Solution} from './solution';

@Injectable()
export class AssignmentsApiService {
  constructor(
    private httpService: HttpService,
  ) {
  }

  async getFileAndGithub(config: Config, uri: string) {
    const assignment = await this.getAssignment(config);
    const prefix = assignment.classroom.prefix;
    const prefixIndex = uri.indexOf(prefix);
    const slashIndex = uri.indexOf('/', prefixIndex + prefix.length);
    const github = uri.substring(prefixIndex + prefix.length + 1, slashIndex);
    const file = uri.substring(slashIndex + 1);
    return {assignment, github, file};
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

  async getAssignment(config: Config): Promise<Assignment> {
    return this.http('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}`, undefined, {
      headers: this.getHeaders(config),
    });
  }

  async getSolution(config: Config, github: string): Promise<Solution> {
    if (config.solution.id) {
      return this.http<Solution>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${config.solution.id}`, undefined, {
        headers: this.getHeaders(config),
      });
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
