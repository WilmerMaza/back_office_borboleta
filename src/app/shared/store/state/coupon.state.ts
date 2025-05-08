import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetCoupons, CreateCoupon, EditCoupon, 
         UpdateCoupon, UpdateCouponStatus, DeleteCoupon, 
         DeleteAllCoupon } from "../action/coupon.action";
import { Coupon } from "../../interface/coupon.interface";
import { CouponService } from "../../services/coupon.service";
import { NotificationService } from "../../services/notification.service";

export class CouponStateModel {
  coupon = {
    data: [] as Coupon[],
    total: 0
  }
  selectedCoupon: Coupon | null;
}

@State<CouponStateModel>({
  name: "coupon",
  defaults: {
    coupon: {
      data: [],
      total: 0
    },
    selectedCoupon: null
  },
})
@Injectable()
export class CouponState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private couponService: CouponService) {}

  @Selector()
  static coupon(state: CouponStateModel) {
    return state.coupon;
  }

  @Selector()
  static selectedCoupon(state: CouponStateModel) {
    return state.selectedCoupon;
  }

  @Selector()
  static coupons(state: CouponStateModel) {
    return state.coupon.data.map(coupon => {
      return { label: coupon?.title, value: coupon?.id }
    });
  }

  @Action(GetCoupons)
  getCoupons(ctx: StateContext<CouponStateModel>, action: GetCoupons) {
    return this.couponService.getCoupons(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            coupon: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length
            }
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateCoupon)
  create(ctx: StateContext<CouponStateModel>, action: CreateCoupon) {
    // Create coupon logic here
  }

  @Action(EditCoupon)
  edit(ctx: StateContext<CouponStateModel>, { id }: EditCoupon) {
    return this.couponService.getCoupons().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(coupon => coupon.id == id);
          ctx.patchState({
            ...state,
            selectedCoupon: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateCoupon)
  update(ctx: StateContext<CouponStateModel>, { payload, id }: UpdateCoupon) {
    // Update coupon logic here
  }

  @Action(UpdateCouponStatus)
  updateStatus(ctx: StateContext<CouponStateModel>, { id, status }: UpdateCouponStatus) {
    // Update coupon status logic here
  }

  @Action(DeleteCoupon)
  delete(ctx: StateContext<CouponStateModel>, { id }: DeleteCoupon) {
    // Delete coupon logic here
  }

  @Action(DeleteAllCoupon)
  deleteAll(ctx: StateContext<CouponStateModel>, { ids }: DeleteAllCoupon) {
    // Delete all coupon logic here
  }

}
