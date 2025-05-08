
import { Routes } from '@angular/router';
import { ShippingCountryComponent } from './shipping-country/shipping-country.component';
import { ShippingComponent } from './shipping.component';

export const shippingRoutes: Routes = [
  {
    path: "",
    component: ShippingComponent
  },
  {
    path: "edit/:id",
    component: ShippingCountryComponent
  }
];
