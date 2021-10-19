import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {AxiosRequestConfig} from 'axios';
import {firstValueFrom} from 'rxjs';
import {Config} from '../config/config';
import {Annotation, AnnotationDto} from './annotation';
import {Assignment} from './assignment';
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

  async createAnnotation(config: Config, solution: string, dto: AnnotationDto): Promise<Annotation> {
    return this.http<Annotation>('POST', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations`, dto, {
      headers: this.getHeaders(config),
    });
  }

  async getAnnotations(config: Config, solution: string, params?: { task?: string, file?: string }): Promise<Annotation[]> {
    return this.http<Annotation[]>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations`, undefined, {
      params,
      headers: this.getHeaders(config),
    });
  }

  async getAnnotation(config: Config, solution: string, id: string): Promise<Annotation> {
    return this.http<Annotation>('GET', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations/${id}`, undefined, {
      headers: this.getHeaders(config),
    });
  }

  async updateAnnotation(config: Config, solution: string, id: string, dto: Partial<AnnotationDto>): Promise<Annotation> {
    return this.http<Annotation>('PATCH', `${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations/${id}`, dto, {
      headers: this.getHeaders(config),
    });
  }

  private async http<T>(method: string, url: string, body?: any, options?: AxiosRequestConfig): Promise<T> {
    try {
      const {data} = await firstValueFrom(this.httpService.request({
        ...options,
        method,
        url,
        data: body,
      }));
      return data;
    } catch (error) {
      console.error(error);
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
