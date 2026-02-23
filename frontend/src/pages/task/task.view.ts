import { AssigneeEnumModel } from '../assignee-enum/assignee-enum.model';
import { StatusEnumModel } from '../status-enum/status-enum.model';

export interface TaskView {
    task_id: number,
    task: string,
    assignee_enum: AssigneeEnumModel,
    due_date: string,
    status_enum: StatusEnumModel,
};