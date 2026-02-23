import { Injectable } from '@angular/core';
import { timer } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class AlertService {

    infoText = "";
    infoHide = true;
    successText = "";
    successHide = true;
    warnText = "";
    warnHide = true;
    errorText = "";
    errorHide = true;

    info(msg: string): void {
        this.infoHide = false;
        this.infoText = msg;
        timer(1000).subscribe(() => this.infoHide = true);
    }

    success(msg: string): void {
        this.successHide = false;
        this.successText = msg;
        timer(1000).subscribe(() => this.successHide = true);
    }

    warn(msg: string): void {
        this.warnHide = false;
        this.warnText = msg;
        timer(1000).subscribe(() => this.warnHide = true);
    }

    error(msg: string): void {
        this.errorHide = false;
        this.errorText = msg;
        timer(1000).subscribe(() => this.errorHide = true);
    }
}
