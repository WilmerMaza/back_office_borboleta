
import { Routes } from '@angular/router';

import { UserComponent } from './user.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';

export const userRoutes: Routes = [
  {
    path: "",
    component: UserComponent
  },
  {
    path: "create",
    component: CreateUserComponent
  },
  {
    path: "edit/:id",
    component: EditUserComponent
  }
];
