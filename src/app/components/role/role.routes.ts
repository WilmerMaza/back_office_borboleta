
import { Routes } from '@angular/router';

import { RoleComponent } from './role.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { EditRoleComponent } from './edit-role/edit-role.component';

export const roleRoutes: Routes = [
  {
    path: "",
    component: RoleComponent
  },
  {
    path: "create",
    component: CreateRoleComponent
  },
  {
    path: "edit/:id",
    component: EditRoleComponent
  }
];
