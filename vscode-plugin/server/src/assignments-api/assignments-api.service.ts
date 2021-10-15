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
}
