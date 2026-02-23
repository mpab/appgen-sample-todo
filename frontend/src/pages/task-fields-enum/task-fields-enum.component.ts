import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TaskFieldsEnumModel } from './task-fields-enum.model';
import { TaskFieldsEnumService } from './task-fields-enum.service';

import { Alert } from "../../components/alert.component/alert.component";

@Component({
    selector: 'app-task-fields-enum',
    imports: [
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        Alert,
    ],
    templateUrl: './task-fields-enum.component.html',
    styleUrl: './task-fields-enum.component.css'
})
export class TaskFieldsEnumComponent {
    columnNames: string[] = ["id", "task_fields_enum", "Action"];
    displayedColumns: string[] = ["id", "task_fields_enum", "Action"];

    taskFieldsEnumCollection: TaskFieldsEnumModel[] = [];
    taskFieldsEnumCollectionCache: TaskFieldsEnumModel[] = [];
    dataSource = new MatTableDataSource<TaskFieldsEnumModel>([]);

    dirtyMap = new Map<number, boolean>();

    constructor(
        private alert: Alert,
        private taskFieldsEnumService: TaskFieldsEnumService,
    ) { }

    ngOnInit(): void {
        this.taskFieldsEnumService.read()
            .subscribe(response =>
                this.handleResponse(response, () => {
                    this.taskFieldsEnumCollection = response.result;
                    this.cacheDataSource();
                    this.dirtyMap.clear();
                })
            );
    }

    handleResponse(response: any, action: any) {
        if (response.status === 'success') {
            action();
            this.alert.success("read data");
        } else {
            this.alert.error(`could not read data: ${response.status}`);
        }
    }

    cacheDataSource(): void {
        this.taskFieldsEnumCollectionCache = [...this.taskFieldsEnumCollection].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.taskFieldsEnumCollection);
    }

    restoreDataSource(): void {
        this.taskFieldsEnumCollection = [...this.taskFieldsEnumCollectionCache].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.taskFieldsEnumCollection);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getNgModel(item: TaskFieldsEnumModel): TaskFieldsEnumModel {
        let boundItem = this.taskFieldsEnumCollection.find(
            (i) => i.task_fields_enum_id === item.task_fields_enum_id);
        if (!boundItem) {
            boundItem = item;
            console.log("ERROR: getNgModel - !boundItem")
        }
        return boundItem;
    }

    onNgModelChange(event: Event, item: TaskFieldsEnumModel) {
        let cachedItem = this.taskFieldsEnumCollectionCache.find(
            (i) => i.task_fields_enum_id === item.task_fields_enum_id);
        if (!cachedItem) {
            cachedItem = item;
            console.log("ERROR: onNgModelChange - !cachedItem");
            return;
        }
        let realItem = this.taskFieldsEnumCollection.find(
            (i) => i.task_fields_enum_id === item.task_fields_enum_id);
        if (!realItem) {
            realItem = item;
            console.log("ERROR: onNgModelChange - !realItem");
            return;
        }
        // TODO: compare/replace entire object
        realItem.task_fields_enum = event.toString();
        if (realItem.task_fields_enum === cachedItem.task_fields_enum) {
            this.dirtyMap.delete(realItem.task_fields_enum_id);
        } else {
            this.dirtyMap.set(realItem.task_fields_enum_id, true);
        }
    }

    disableSave(item: TaskFieldsEnumModel): boolean {
        return !this.dirtyMap.has(item.task_fields_enum_id);
    }

    onClickSave(item: TaskFieldsEnumModel) {
        this.taskFieldsEnumService.update(item)
            .subscribe(response => {
                if (response.status === 'success') {
                    this.cacheDataSource();
                    this.alert.success("saved data");
                    this.dirtyMap.delete(item.task_fields_enum_id);
                } else {
                    this.restoreDataSource();
                    this.alert.error(`could not save data: ${response.status}`);
                }
            });
    }

}
