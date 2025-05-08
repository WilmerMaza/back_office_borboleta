
import { Routes } from '@angular/router';

import { PageComponent } from './page.component';
import { CreatePageComponent } from './create-page/create-page.component';
import { EditPageComponent } from './edit-page/edit-page.component';

export const pageRoutes: Routes = [
  {
    path: "",
    component: PageComponent
  },
  {
    path: "create",
    component: CreatePageComponent
  },
  {
    path: "edit/:id",
    component: EditPageComponent
  }
];
