
import { Routes } from '@angular/router';

import { ProductComponent } from './product.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';

export const productRoutes: Routes = [
  {
    path: "",
    component: ProductComponent
  },
  {
    path: "create",
    component: CreateProductComponent
  },
  {
    path: "edit/:id",
    component: EditProductComponent
  }
];
