import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
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
    return {github, file};
  }

  async getAssignment(config: Config): Promise<Assignment> {
    const {data: assignment} = await firstValueFrom(this.httpService.get(`${config.apiServer}/api/v1/assignments/${config.assignment.id}`, {
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return assignment;
  }

  async getSolution(config: Config, github: string): Promise<Solution> {
    const {data: solutions} = await firstValueFrom(this.httpService.get(`${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions`, {
      params: {
        'author.github': github,
      },
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return solutions[0];
  }

  async createAnnotation(config: Config, solution: string, dto: AnnotationDto): Promise<Annotation> {
    const {data} = await firstValueFrom(this.httpService.post<Annotation>(`${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations`, dto, {
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return data;
  }

  async getAnnotations(config: Config, solution: string, file: string): Promise<Annotation[]> {
    const {data} = await firstValueFrom(this.httpService.get<Annotation[]>(`${config.apiServer}/api/v1/assignments/${config.assignment.id}/solutions/${solution}/annotations`, {
      params: {
        file,
      },
      headers: {
        'Assignment-Token': config.assignment.token,
      },
    }));
    return data;
  }
}
