import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

class Validator {
    formControl: FormControl;
    message: WritableSignal<string>;

    constructor() {
        this.formControl = new FormControl();
        this.message = signal('');
    }

    showError() {
    }
};

@Component({
    selector: 'app-assignee-enum-form',
    styleUrl: './assignee-enum-form.component.css',
    templateUrl: './assignee-enum-form.component.html',
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatGridListModule,
        FormsModule,
        MatSelectModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneeEnumFormComponent {
    dataSource = inject(MAT_DIALOG_DATA);
    validators: Validator[] = [];
    dataSourceIsInvalid: number = 0;
    disableAction = true;
    disableDelete = true;

    constructor() {
        this.dataSource.columnNames.forEach((_: any, idx: number) => {
            let v = new Validator();
            v.message.set(`${this.dataSource.columnNames[idx]} is required`);
            this.validators.push(v);
            merge(v.formControl.statusChanges, v.formControl.valueChanges)
                .pipe(takeUntilDestroyed())
                .subscribe(() => {
                    this.onValidationEvent(idx, v);
                });
        });
    }

    isHidden = (field: string) => field.startsWith('--hide');

    getDeleteCheckbox() {
        return !this.disableDelete;
    }

    toggleDeleteCheckbox(_: Event) {
        this.disableDelete = !this.disableDelete;
        this.setDisableAction();
    }

    setDisableAction() {
        this.disableAction = this.dataSourceIsInvalid != 0 || !this.disableDelete;
        // console.log(`setDisableAction(): ${this.disableAction}`)
    }

    onValidationEvent(idx: number, validator: Validator) {
        let valid = validator.formControl.valid;
        let mask = 1 << idx;
        // console.log(`onValidationEvent: ${idx}=${valid}, mask=${mask}`);
        // console.log(`old dataSourceIsInvalid: ${this.dataSourceIsInvalid}`);
        if (valid) {
            this.dataSourceIsInvalid &= ~mask; // clear
        } else {
            this.dataSourceIsInvalid |= mask; // set
        }
        // console.log(`new dataSourceIsInvalid: ${this.dataSourceIsInvalid}`);
        this.setDisableAction();
    }
}
