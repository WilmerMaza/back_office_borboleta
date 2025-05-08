
import { Routes } from '@angular/router';

import { OrderComponent } from './order.component';
import { DetailsComponent } from './details/details.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { CheckoutComponent } from './checkout/checkout.component';

export const orderRoutes: Routes = [
  {
    path: '',
    component: OrderComponent
  },
  {
    path: 'details/:id',
    component: DetailsComponent
  },
  {
    path: 'create',
    component: CreateOrderComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  }
];
