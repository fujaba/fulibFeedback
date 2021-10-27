import {Injectable} from '@nestjs/common';
import {getNodePath, parseTree} from 'engine';
import {Task} from '../assignments-api/assignment';

@Injectable()
export class TaskMatcherService {
  getPath(text: string, position: number): string {
    const node = parseTree(text);
    return getNodePath(node, position).map(n => n.declaration).join(' { ');
  }

  getSelectors(task: Task): string[] {
    const pattern = /`([^`]*)`/g;
    return Array.from(task.description.matchAll(pattern)).map(([, selector]) => selector);
  }

  applySelectors(selectors: string[], path: string, start: number): number {
    for (const selector of selectors) {
      const index = path.indexOf(selector, start);
      if (index < 0) {
        return -1;
      }
      start = index + selector.length;
    }
    return start;
  }
}
