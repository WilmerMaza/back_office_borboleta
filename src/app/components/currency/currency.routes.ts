
import { Routes } from '@angular/router';

import { CurrencyComponent } from './currency.component';
import { CreateCurrencyComponent } from './create-currency/create-currency.component';
import { EditCurrencyComponent } from './edit-currency/edit-currency.component';

export const currencyRoutes: Routes = [
  {
    path: "",
    component: CurrencyComponent
  },
  {
    path: "create",
    component: CreateCurrencyComponent
  },
  {
    path: "edit/:id",
    component: EditCurrencyComponent
  }
];
