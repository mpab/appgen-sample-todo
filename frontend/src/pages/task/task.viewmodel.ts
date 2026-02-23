import { TaskApiModel } from "./task-api.model";
import { TaskModel } from "./task.model";
import { TaskView } from "./task.view";

export class TaskViewModel {
    static createView = (): TaskView => {
        return {
            task_id: -1,
            task: '',
            assignee_enum: {
                assignee_enum_id: -1,
                assignee_enum: '',
            },
            due_date: '',
            status_enum: {
                status_enum_id: -1,
                status_enum: '',
            },
        };
    }

    static mapModelToView(apiModel: TaskApiModel, model: TaskModel): TaskView {
        let view = Object.assign([] as unknown as TaskView, model);
        let x;
        x = apiModel.references.assignee_enum.find((i) =>
            model.assignee_enum_id === i.assignee_enum_id);
            if (x) view.assignee_enum = x;
        x = apiModel.references.status_enum.find((i) =>
            model.status_enum_id === i.status_enum_id);
            if (x) view.status_enum = x;
        return view;
    }

    static mapViewToModel(apiModel: TaskApiModel, view: TaskView): TaskModel {
        let model = Object.assign({} as TaskModel, view);
        let x;
        x = apiModel.references.assignee_enum.find((i) =>
            view.assignee_enum === i);
            if (x) model.assignee_enum_id = x.assignee_enum_id;
        x = apiModel.references.status_enum.find((i) =>
            view.status_enum === i);
            if (x) model.status_enum_id = x.status_enum_id;
        return model;
    }
}