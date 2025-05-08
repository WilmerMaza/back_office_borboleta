
import { Routes } from '@angular/router';
import { CouponComponent } from './coupon.component';
import { CreateCouponComponent } from './create-coupon/create-coupon.component';
import { EditCouponComponent } from './edit-coupon/edit-coupon.component';

export const couponRoutes: Routes = [
  {
    path: "",
    component: CouponComponent
  },
  {
    path: "create",
    component: CreateCouponComponent
  },
  {
    path: "edit/:id",
    component: EditCouponComponent
  }
];
