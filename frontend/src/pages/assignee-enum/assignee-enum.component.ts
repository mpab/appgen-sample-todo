import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AssigneeEnumFormComponent } from './assignee-enum-form.component'
import { AssigneeEnumModel } from './assignee-enum.model';
import { AssigneeEnumService } from './assignee-enum.service';

import { Alert } from "../../components/alert.component/alert.component";

@Component({
    selector: 'app-assignee-enum',
    imports: [
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        Alert,
    ],
    templateUrl: './assignee-enum.component.html',
    styleUrl: './assignee-enum.component.css'
})
export class AssigneeEnumComponent {
    columnNames: string[] = ["", "Assignee"];
    displayedColumns: string[] = ["Assignee"];

    assigneeEnumCollection: AssigneeEnumModel[] = [];
    assigneeEnumCollectionCache: AssigneeEnumModel[] = [];
    dataSource = new MatTableDataSource<AssigneeEnumModel>([]);

    constructor(
            private alert: Alert,
            private dialog: MatDialog,
            private assigneeEnumService: AssigneeEnumService,
        ) { }

    ngOnInit(): void {
        this.assigneeEnumService.read()
            .subscribe(response =>
                this.handleResponse(response, () => {
                    this.assigneeEnumCollection = response.result;
                    this.cacheDataSource();
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
        this.assigneeEnumCollectionCache = [...this.assigneeEnumCollection].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.assigneeEnumCollection);
    }

    restoreDataSource(): void {
        this.assigneeEnumCollection = [...this.assigneeEnumCollectionCache].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.assigneeEnumCollection);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickAdd() {
        let createItem = {
            entity: {
                assignee_enum_id: -1,
                assignee_enum: '',
            }
        };

        const dialogRef = this.dialog.open(AssigneeEnumFormComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '30%',
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
                this.restoreDataSource(); // revert any edits
                return;
            }

            if (result == 'action') {
                this.assigneeEnumService.create(createItem.entity)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.assigneeEnumCollection.push(response.result[0]);
                            this.cacheDataSource();
                            this.alert.success("added data");
                        } else {
                            // restore not required as no record created
                            this.alert.error(`could not add data: ${response.status}`);
                        }
                    });
            }
        });
    }

   onClickEdit(item: AssigneeEnumModel) {
        let updateItem = {
            entity: item,
            constraints: {
            },
        };

        const dialogRef = this.dialog.open(AssigneeEnumFormComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            height: '30%',
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
                this.restoreDataSource(); // revert any edits
                return;
            }

            if (result === 'delete') {
                this.assigneeEnumService.delete(item.assignee_enum_id)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.assigneeEnumCollection = this.assigneeEnumCollection.filter(i => i !== item);
                            this.cacheDataSource();
                            this.alert.success("deleted data");
                        } else {
                            this.restoreDataSource();
                            this.alert.error(`could not delete data: ${response.status}`);
                        }
                    });
            }

            if (result == 'action') {
                this.assigneeEnumService.update(updateItem.entity)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.cacheDataSource();
                            this.alert.success("saved data");
                        } else {
                            this.restoreDataSource();
                            this.alert.error(`could not save data: ${response.status}`);
                        }
                    });
            }
        });
    }

}
