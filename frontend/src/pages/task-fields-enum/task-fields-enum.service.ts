import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { TaskFieldsEnumModel } from './task-fields-enum.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

export interface Response {
    result: TaskFieldsEnumModel[];
    status: string;
    message: string;
};

@Injectable({
    providedIn: 'root'
})

export class TaskFieldsEnumService {

    constructor(private http: HttpClient) { }

    private apiUrl = 'http://' + window.location.hostname + ':3000/api/TaskFieldsEnum';

    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    private log(message: string) {// console log for now
        console.log(message);
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     *
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    serviceError: Response = {result: [], status: "error - network", message: ""}

    // Create TaskFieldsEnum
    create(item: TaskFieldsEnumModel): Observable<Response> {
        return this.http.post<Response>(this.apiUrl, item, this.httpOptions)
            .pipe(
                tap((response: Response) => this.log(`TaskFieldsEnum.create(${response.status})`)),
                catchError(this.handleError<Response>('TaskFieldsEnum.create()', this.serviceError))
            );
    }

    // Read TaskFieldsEnum collection
    read(): Observable<Response> {
        return this.http.get<Response>(this.apiUrl)
            .pipe(
                tap(_ => this.log('TaskFieldsEnum.read()')),
                catchError(this.handleError<Response>('TaskFieldsEnum.read()', this.serviceError))
            );
    }

    // Read TaskFieldsEnum by id
    find(task_fields_enum_id: number): Observable<Response> {
        const url = `${this.apiUrl}/${task_fields_enum_id}`;
        return this.http.get<Response>(url)
            .pipe(
                tap(_ => this.log(`TaskFieldsEnum.find(${task_fields_enum_id})`)),
                catchError(this.handleError<Response>(`TaskFieldsEnum.find(${task_fields_enum_id})`, this.serviceError))
            );
    }

    // Update TaskFieldsEnum
    update(item: TaskFieldsEnumModel): Observable<Response> {
        return this.http.put<Response>(this.apiUrl, item, this.httpOptions)
            .pipe(
                tap(_ => this.log(`TaskFieldsEnum.update(${item.task_fields_enum_id})`)),
                catchError(this.handleError<Response>(`TaskFieldsEnum.update(${item.task_fields_enum_id})`, this.serviceError))
            );
    }

    // Delete TaskFieldsEnum
    delete(task_fields_enum_id: number): Observable<Response> {
        const url = `${this.apiUrl}/${task_fields_enum_id}`;
        return this.http.delete<Response>(url, this.httpOptions).pipe(
            tap(_ => this.log(`TaskFieldsEnum.delete(${task_fields_enum_id})`)),
            catchError(this.handleError<Response>(`TaskFieldsEnum.delete(${task_fields_enum_id})`, this.serviceError))
        );
    }
}
