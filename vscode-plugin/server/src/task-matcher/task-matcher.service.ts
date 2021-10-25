import { Injectable } from '@nestjs/common';
import {Task} from '../assignments-api/assignment';

@Injectable()
export class TaskMatcherService {
  getApplicableRange(task: Task, text: string): [number, number] | undefined {
    const pattern = /`([^`]*)`/g;
    let start = 0;
    let end = text.length;
    for (const match of task.description.matchAll(pattern)) {
      const [, search] = match;
      start = text.indexOf(search, start);
      if (start < 0 || start >= end) {
        return undefined;
      }
      const braceStartIndex = text.indexOf('{', start + search.length);
      if (braceStartIndex < 0 || braceStartIndex >= end) {
        return undefined;
      }
      const braceEndIndex = this.findMatchingBrace(text, braceStartIndex, end);
      if (braceStartIndex < 0 || braceEndIndex >= end) {
        return undefined;
      }
      start = braceStartIndex + 1;
      end = braceEndIndex;
    }
    return [start, end];
  }

  findMatchingBrace(text: string, start: number, end: number): number {
    let count = 0;
    for (let i = start; i < end; i++) {
      switch (text.charAt(i)) {
        case '{':
          count++;
          break;
        case '}':
          count--;
          if (count == 0) {
            return i;
          }
          break;
      }
    }
    return -1;
  }
}
