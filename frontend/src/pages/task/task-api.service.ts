import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { TaskView } from './task.view';
import { TaskModel } from './task.model';
import { TaskViewModel } from './task.viewmodel';
import { TaskApiModel } from './task-api.model';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

const API_UUID = "30125261-A5CA-48E4-997E-3935C07BED5D";

export interface Response<T> {
    result: T;
    status: string;
    message: string;
};

type ResponseEntityModel = Response<TaskModel[]>;
type ResponseApiModel = Response<TaskApiModel>;
let mvMapper = TaskViewModel;

@Injectable({
    providedIn: 'root'
})

export class TaskApiService {

    static createApiModel = (): TaskApiModel => {
        return {
            version: {
                shape: '',
                major: 0,
                minor: 0,
                revision: 0
            },
            entities: [],
            views: [],
            entity_fields: [],
            references: {
                assignee_enum: [],
                status_enum: [],
            },
            _links: {
                "self": "",
                "next": "",
                "prev": "",
                "first": "",
                "last": ""
            },
            _paging: {
                entity_count: 0,
                page_size: 0,
                prev_cursor: 0,
                next_cursor: 0,
                first_cursor: 0,
                last_cursor: 0
            }
        };
    }
    public apiModel = TaskApiService.createApiModel()

    constructor(private http: HttpClient) {
    }

    protected apiUrlBase = 'http://' + window.location.hostname + ':3000'
    protected apiStem = '/api/Task';
    protected apiUrl = (query: string = '') => this.apiUrlBase + this.apiStem + query;
    protected linkUrl = (link: string) => this.apiUrlBase + link;

    private httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    }

    private log(message: string) {// console log for now
        console.log(message);
    }

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

    private modelError(message = "", result = []) {
        return {
            result: result,
            status: "error - network",
            message: message
        };
    }

    private apiModelError(message = "", result = TaskApiService.createApiModel()) {
        return {
            result: result,
            status: "error - network",
            message: message
        };
    }

    /*
        Back-End-For-Front-End With Model View Mapping
    */

    readApiModel(): Observable<ResponseApiModel> {
        let fn = 'TaskApiService.readApiModel()';
        return this.http.get<ResponseApiModel>(this.apiUrl())
            .pipe(
                tap(response => {
                    this.log(`${fn} => ${response.status}`);
                    if (response.result) {
                        this.apiModel = response.result;
                        let expected = API_UUID.toLowerCase();
                        let api_shape = this.apiModel.version.shape.toLowerCase();
                        if (api_shape !== expected) throw (`api shape mismatch: expected: ${expected}, got: ${api_shape}`);

                        if (response.result.entities) {
                            let inflated_entities: TaskView[] = [];
                            this.apiModel.entities.forEach((e) => {
                                inflated_entities.push(mvMapper.mapModelToView(this.apiModel, e));
                            });
                            this.apiModel.views = inflated_entities;
                        }
                    }
                }),
                catchError(this.handleError<ResponseApiModel>(fn, this.apiModelError()))
            );
    }

    createEntity(view: TaskView): Observable<ResponseEntityModel> {
        let fn = 'TaskApiService.createEntity()';
        let model = mvMapper.mapViewToModel(this.apiModel, view);
        return this.http.post<ResponseEntityModel>(this.apiUrl(), model, this.httpOptions)
            .pipe(
                tap((response: ResponseEntityModel) => {
                    this.log(`${fn} => ${response.status}`);
                    if (response.status === 'success') {
                        this.apiModel.views.push(mvMapper.mapModelToView(this.apiModel, response.result[0]));
                        // TODO: get count from API
                        ++this.apiModel._paging.entity_count;
                    }
                }),
                catchError(this.handleError<ResponseEntityModel>(fn, this.modelError()))
            );
    }

    updateEntity(view: TaskView): Observable<ResponseEntityModel> {
        let fn = `TaskApiService.updateEntity(${view.task_id})`;
        let model = mvMapper.mapViewToModel(this.apiModel, view);
        return this.http.put<ResponseEntityModel>(this.apiUrl(), model, this.httpOptions)
            .pipe(
                tap(response => {
                    this.log(`${fn} => ${response.status}`);
                    if (response.status === 'success') {
                        const idx = this.apiModel.views.findIndex((o) => o.task_id === model.task_id) ?? -1;
                        if (idx !== -1) {
                            this.apiModel.views.splice(idx, 1, mvMapper.mapModelToView(this.apiModel, response.result[0]));
                        }
                    }
                }),
                catchError(this.handleError<ResponseEntityModel>(fn, this.modelError()))
            );
    }

    deleteEntity(view: TaskView): Observable<ResponseEntityModel> {
        let fn = `TaskApiService.deleteEntity(${view.task_id})`;
        const url = `${this.apiUrl()}/${view.task_id}`;
        return this.http.delete<ResponseEntityModel>(url, this.httpOptions).pipe(
            tap(response => {
                this.log(`${fn} => ${response.status}`);
                if (response.status === 'success') {
                    const idx = this.apiModel.views.findIndex((o) => o.task_id === view.task_id) ?? -1;
                    if (idx !== -1) {
                        this.apiModel.views.splice(idx, 1);
                        // TODO: get count from API
                        --this.apiModel._paging.entity_count;
                    }
                }
            }),
            catchError(this.handleError<ResponseEntityModel>(fn, this.modelError()))
        );
    }

    /*
        Paging
    */

    readPage(fn: string, url: string) {
        return this.http.get<ResponseApiModel>(url)
            .pipe(
                tap(response => {
                    this.log(`${fn} => ${response.status}`);
                    if (response.result) {
                        let expected = API_UUID.toLowerCase();
                        let api_shape = response.result.version.shape.toLowerCase();
                        if (api_shape !== expected) throw (`api shape mismatch: expected: ${expected}, got: ${api_shape}`);
                        if (response.result.entities) {
                            this.apiModel.entities = response.result.entities
                            let inflated_entities: TaskView[] = [];
                            this.apiModel.entities.forEach((e) => {
                                inflated_entities.push(mvMapper.mapModelToView(this.apiModel, e));
                            });
                            this.apiModel.views = inflated_entities;
                            this.apiModel._links = response.result._links;
                            this.apiModel._paging = response.result._paging;
                        }
                    }
                }),
                catchError(this.handleError<ResponseApiModel>(fn, this.apiModelError()))
            );
    }

    nextPage(): Observable<ResponseApiModel> {
        return this.readPage('TaskApiService.nextPage()', this.linkUrl(this.apiModel._links.next));
    }

    previousPage(): Observable<ResponseApiModel> {
        return this.readPage('TaskApiService.previousPage()', this.linkUrl(this.apiModel._links.prev));
    }

    firstPage(): Observable<ResponseApiModel> {
        return this.readPage('TaskApiService.firstPage()', this.linkUrl(this.apiModel._links.first));
    }

    lastPage(): Observable<ResponseApiModel> {
        return this.readPage('TaskApiService.lastPage()', this.linkUrl(this.apiModel._links.last));
    }

    changePageSize(pageSize: number): Observable<ResponseApiModel> {
        return this.readPage('TaskApiService.changePageSize()', this.apiUrl(`?page_size=${pageSize}`));
    }

}
