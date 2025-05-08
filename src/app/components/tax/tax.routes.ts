
import { Routes } from '@angular/router';
import { CreateTaxComponent } from './create-tax/create-tax.component';
import { EditTaxComponent } from './edit-tax/edit-tax.component';
import { TaxComponent } from './tax.component';

export const taxRoutes: Routes = [
  {
    path: "",
    component: TaxComponent
  },
  {
    path: "create",
    component: CreateTaxComponent
  },
  {
    path: "edit/:id",
    component: EditTaxComponent
  }
];
