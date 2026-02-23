import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { TaskFormComponent } from './task-form.component'
import { TaskApiService } from './task-api.service';
import { TaskView } from './task.view';
import { TaskViewModel } from './task.viewmodel';

import { Alert } from "../../components/alert.component/alert.component";

@Component({
    selector: 'app-task',
    imports: [
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatPaginatorModule,
        Alert,
    ],
    templateUrl: './task.component.html',
    styleUrl: './task.component.css'
})
export class TaskComponent {
    columnNames: string[] = ["Task Id", "Task", "Assignee Enum Id", "Due Date", "Status Enum Id"];
    displayedColumns: string[] = ["0", "1", "2", "3", "4"];
    dataSource = new MatTableDataSource<TaskView>([]);

    constructor(
        private alert: Alert,
        private dialog: MatDialog,
        private service: TaskApiService,
    ) { }

    configureDisplayedColumns() {
        let columnNames: string[] = [];
        let displayedColumns: string[] = [];

        this.service.apiModel.entity_fields.forEach((v, i) => {
            columnNames.push(v);
            if (!v.startsWith('--hide')) {
                displayedColumns.push(`${i}`);
            }
        });

        if (columnNames.length && displayedColumns.length) {
            this.columnNames = columnNames;
            this.displayedColumns = displayedColumns;
        }
    }

    ngOnInit(): void {
        this.service.readApiModel()
            .subscribe(response =>
                this.handleResponse(response, () => {
                    this.configureDisplayedColumns();
                    this.onDataChange();
                })
            );
    }

    onDataChange(): void {
        this.dataSource = new MatTableDataSource(this.service.apiModel.views);
        this.paginatorPageSize = this.service.apiModel._paging.page_size;
        this.paginator.length = this.service.apiModel._paging.entity_count;
    }

    handleResponse(response: any, action: any) {
        if (response.status === 'success') {
            action();
            this.alert.success("read data");
        } else {
            this.alert.error(`could not read data: ${response.status}`);
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickAdd() {
        let createItem = {
            entity: TaskViewModel.createView(),
            constraints: this.service.apiModel.references
        };

        const dialogRef = this.dialog.open(TaskFormComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '80%',
            width: '40%',
            data: {
                item: createItem,
                columnNames: this.columnNames,
                crudMode: "Create",
                crudAction: "Save",
                hideDelete: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            // clicking outside of the dialog returns undefined
            if (result === undefined || result === 'cancel') {
                return;
            }

            if (result == 'action') {
                this.service.createEntity(createItem.entity)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.alert.success("added data");
                            this.onDataChange();
                        } else {
                            this.alert.error(`could not add data: ${response.status}`);
                        }
                    });
            }
        });
    }

    onClickEdit(item: TaskView) {
        let updateItem = {
            entity: Object.assign({}, item),
            constraints: this.service.apiModel.references
        };

        const dialogRef = this.dialog.open(TaskFormComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '80%',
            width: '40%',
            data: {
                item: updateItem,
                columnNames: this.columnNames,
                crudMode: "Edit",
                crudAction: "Save"
            }
        });
        dialogRef.afterClosed().subscribe(result => {

            // clicking outside of the dialog returns undefined
            if (result === undefined || result === 'cancel') {
                // no edits to revert as item is a copy
                return;
            }

            if (result === 'delete') {
                this.service.deleteEntity(item)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.alert.success("deleted data");
                            this.onDataChange();
                        } else {
                            this.alert.error(`could not delete data: ${response.status}`);
                        }
                    });
            }

            if (result == 'action') {
                this.service.updateEntity(updateItem.entity)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.alert.success("saved data");
                            this.onDataChange();
                        } else {
                            this.alert.error(`could not save data: ${response.status}`);
                        }
                    });
            }
        });
    }

    // ---------------------------------------------------------------------------------------------------------------------------------------
    // NAVIGATION/PAGING

    @ViewChild(MatPaginator)
    paginator: MatPaginator = new MatPaginator;

    paginatorPageSize = 0;
    paginatorPageSizeOptions = [5, 10, 25];
    paginatorHidePageSize = false;
    paginatorShowPageSizeOptions = true;
    paginatorShowFirstLastButtons = true;
    paginatorDisabled = false;

    handlePaginatorEvent(e: PageEvent) {

        if (e.pageSize != this.paginatorPageSize) {
            this.service.changePageSize(e.pageSize).subscribe((response: { status: string; }) => {
                if (response.status === 'success') {
                    this.alert.success("read data");
                    this.onDataChange();
                    this.paginator.pageIndex = 0;

                } else {
                    this.alert.warn(`invalid page size action: ${response.status}`);
                }
            })
            return; // suppress weird double-event
        }

        let diff = e.previousPageIndex ? e.pageIndex - e.previousPageIndex : e.pageIndex;
        let func;
        if (this.service.apiModel._links.last && diff > 1) func = this.service.lastPage();
        else if (this.service.apiModel._links.next && diff > 0) func = this.service.nextPage();
        else if (this.service.apiModel._links.first && diff < -1) func = this.service.firstPage();
        else if (this.service.apiModel._links.prev && diff < 0) func = this.service.previousPage();
        else return;

        func.subscribe((response: { status: string; }) => {
            if (response.status === 'success') {
                this.alert.success("read data");
                this.onDataChange();
            } else {
                this.alert.warn(`invalid navigation action: ${response.status}`);
            }
        })
    }

}
