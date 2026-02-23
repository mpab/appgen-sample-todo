import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home.component/home.component';

export const routes: Routes = [
      { path: 'Home', component: HomeComponent }
    , { path: 'Assignee', loadChildren: () => import('../pages/assignee-enum/assignee-enum.routes').then(m => m.ASSIGNEE_ENUM_ROUTES) }
    , { path: 'Status', loadChildren: () => import('../pages/status-enum/status-enum.routes').then(m => m.STATUS_ENUM_ROUTES) }
    , { path: 'Task Fields', loadChildren: () => import('../pages/task-fields-enum/task-fields-enum.routes').then(m => m.TASK_FIELDS_ENUM_ROUTES) }
    , { path: 'Task', loadChildren: () => import('../pages/task/task.routes').then(m => m.TASK_ROUTES) }
];