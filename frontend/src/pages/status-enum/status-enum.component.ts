import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { StatusEnumFormComponent } from './status-enum-form.component'
import { StatusEnumModel } from './status-enum.model';
import { StatusEnumService } from './status-enum.service';

import { Alert } from "../../components/alert.component/alert.component";

@Component({
    selector: 'app-status-enum',
    imports: [
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        Alert,
    ],
    templateUrl: './status-enum.component.html',
    styleUrl: './status-enum.component.css'
})
export class StatusEnumComponent {
    columnNames: string[] = ["", "Status"];
    displayedColumns: string[] = ["Status"];

    statusEnumCollection: StatusEnumModel[] = [];
    statusEnumCollectionCache: StatusEnumModel[] = [];
    dataSource = new MatTableDataSource<StatusEnumModel>([]);

    constructor(
            private alert: Alert,
            private dialog: MatDialog,
            private statusEnumService: StatusEnumService,
        ) { }

    ngOnInit(): void {
        this.statusEnumService.read()
            .subscribe(response =>
                this.handleResponse(response, () => {
                    this.statusEnumCollection = response.result;
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
        this.statusEnumCollectionCache = [...this.statusEnumCollection].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.statusEnumCollection);
    }

    restoreDataSource(): void {
        this.statusEnumCollection = [...this.statusEnumCollectionCache].map((x) => ({ ...x }));
        this.dataSource = new MatTableDataSource(this.statusEnumCollection);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickAdd() {
        let createItem = {
            entity: {
                status_enum_id: -1,
                status_enum: '',
            }
        };

        const dialogRef = this.dialog.open(StatusEnumFormComponent, {
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
                this.statusEnumService.create(createItem.entity)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.statusEnumCollection.push(response.result[0]);
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

   onClickEdit(item: StatusEnumModel) {
        let updateItem = {
            entity: item,
            constraints: {
            },
        };

        const dialogRef = this.dialog.open(StatusEnumFormComponent, {
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
                this.statusEnumService.delete(item.status_enum_id)
                    .subscribe(response => {
                        if (response.status === 'success') {
                            this.statusEnumCollection = this.statusEnumCollection.filter(i => i !== item);
                            this.cacheDataSource();
                            this.alert.success("deleted data");
                        } else {
                            this.restoreDataSource();
                            this.alert.error(`could not delete data: ${response.status}`);
                        }
                    });
            }

            if (result == 'action') {
                this.statusEnumService.update(updateItem.entity)
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
