import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { AssigneeEnumModel } from './assignee-enum.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

export interface Response {
    result: AssigneeEnumModel[];
    status: string;
    message: string;
};

@Injectable({
    providedIn: 'root'
})

export class AssigneeEnumService {

    constructor(private http: HttpClient) { }

    private apiUrl = 'http://' + window.location.hostname + ':3000/api/AssigneeEnum';

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

    // Create AssigneeEnum
    create(item: AssigneeEnumModel): Observable<Response> {
        return this.http.post<Response>(this.apiUrl, item, this.httpOptions)
            .pipe(
                tap((response: Response) => this.log(`AssigneeEnum.create(${response.status})`)),
                catchError(this.handleError<Response>('AssigneeEnum.create()', this.serviceError))
            );
    }

    // Read AssigneeEnum collection
    read(): Observable<Response> {
        return this.http.get<Response>(this.apiUrl)
            .pipe(
                tap(_ => this.log('AssigneeEnum.read()')),
                catchError(this.handleError<Response>('AssigneeEnum.read()', this.serviceError))
            );
    }

    // Read AssigneeEnum by id
    find(assignee_enum_id: number): Observable<Response> {
        const url = `${this.apiUrl}/${assignee_enum_id}`;
        return this.http.get<Response>(url)
            .pipe(
                tap(_ => this.log(`AssigneeEnum.find(${assignee_enum_id})`)),
                catchError(this.handleError<Response>(`AssigneeEnum.find(${assignee_enum_id})`, this.serviceError))
            );
    }

    // Update AssigneeEnum
    update(item: AssigneeEnumModel): Observable<Response> {
        return this.http.put<Response>(this.apiUrl, item, this.httpOptions)
            .pipe(
                tap(_ => this.log(`AssigneeEnum.update(${item.assignee_enum_id})`)),
                catchError(this.handleError<Response>(`AssigneeEnum.update(${item.assignee_enum_id})`, this.serviceError))
            );
    }

    // Delete AssigneeEnum
    delete(assignee_enum_id: number): Observable<Response> {
        const url = `${this.apiUrl}/${assignee_enum_id}`;
        return this.http.delete<Response>(url, this.httpOptions).pipe(
            tap(_ => this.log(`AssigneeEnum.delete(${assignee_enum_id})`)),
            catchError(this.handleError<Response>(`AssigneeEnum.delete(${assignee_enum_id})`, this.serviceError))
        );
    }
}
