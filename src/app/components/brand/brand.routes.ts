
import { Routes } from '@angular/router';

import { BrandComponent } from './brand.component';
import { CreateBrandComponent } from './create-brand/create-brand.component';
import { EditBrandComponent } from './edit-brand/edit-brand.component';

export const brandRoutes: Routes = [
  {
    path: "",
    component: BrandComponent
  },
  {
    path: "create",
    component: CreateBrandComponent
  },
  {
    path: "edit/:id",
    component: EditBrandComponent
  },
];
