import { AssigneeEnumModel } from '../assignee-enum/assignee-enum.model';
import { StatusEnumModel } from '../status-enum/status-enum.model';
import { TaskView } from './task.view';
import { TaskModel as TaskModel } from './task.model';

export interface TaskApiModel {
    version: {
        shape: string,
        major: number,
        minor: number,
        revision: number
    },
    entities: TaskModel[],
    views: TaskView[],
    entity_fields: string[],
    references: {
        assignee_enum: AssigneeEnumModel[],
        status_enum: StatusEnumModel[],
    }
    _links: {
      self: string,
      next: string,
      prev: string,
      first: string,
      last: string
    },
    _paging: {
        entity_count: number,
        page_size: number,
        prev_cursor: number,
        next_cursor: number,
        first_cursor: number,
        last_cursor: number
    }
};
