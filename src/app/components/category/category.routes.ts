
import { Routes } from '@angular/router';

import { CategoryComponent } from './category.component';
import { EditCategoryComponent } from './edit-category/edit-category.component';

export const categoryRoutes: Routes = [
  {
    path: "",
    component: CategoryComponent
  },
  {
    path: "edit/:id",
    component: EditCategoryComponent
  }
];
