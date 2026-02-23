import { Component, Injectable } from '@angular/core';
import { AlertService } from './alert.service';
@Injectable({
    providedIn: 'root'
})
@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.css'
})
export class Alert {
    constructor(public alertService: AlertService) { }

    info(msg: string): void {
        this.alertService.info(msg);
    }

    success(msg: string): void {
        this.alertService.success(msg);
    }

    warn(msg: string): void {
        this.alertService.warn(msg);
    }


    error(msg: string): void {
        this.alertService.error(msg);
    }
}
