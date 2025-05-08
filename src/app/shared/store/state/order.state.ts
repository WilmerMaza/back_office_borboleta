import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetOrders, SelectUser, ViewOrder, Checkout, PlaceOrder, UpdateOrderStatus, Clear, DownloadInvoice } from "../action/order.action";
import { Order, OrderCheckout } from "../../interface/order.interface";
import { User } from "../../interface/user.interface";
import { UserService } from "../../services/user.service";
import { OrderService } from "../../services/order.service";

export class OrderStateModel {
  order = {
    data: [] as Order[],
    total: 0
  }
  selectedOrder: Order | null
  selectedUser: User | null
  checkout: OrderCheckout | null
}

@State<OrderStateModel>({
  name: "order",
  defaults: {
    order: {
      data: [],
      total: 0
    },
    selectedOrder: null,
    selectedUser: null,
    checkout: null
  },
})
@Injectable()
export class OrderState {
  
  constructor(private router: Router,
    private orderService: OrderService,
    private userService: UserService) {}

  @Selector()
  static order(state: OrderStateModel) {
    return state.order;
  }

  @Selector()
  static selectedUser(state: OrderStateModel) {
    return state.selectedUser;
  }

  @Selector()
  static selectedOrder(state: OrderStateModel) {
    return state.selectedOrder;
  }

  @Selector()
  static checkout(state: OrderStateModel) {
    return state.checkout;
  }

  @Action(GetOrders)
  getOrders(ctx: StateContext<OrderStateModel>, action: GetOrders) {
    return this.orderService.getOrders(action?.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            order: {
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

  @Action(SelectUser)
  selectUser(ctx: StateContext<OrderStateModel>, { id }: SelectUser) {
    return this.userService.getUsers().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(order => order.id == id);
          ctx.patchState({
            ...state,
            selectedUser: result,
            checkout: null
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(ViewOrder)
  viewOrder(ctx: StateContext<OrderStateModel>, { id }: ViewOrder) {
    return this.orderService.getOrders().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(order => Number(order.order_number) == id);
          ctx.patchState({
            ...state,
            selectedOrder: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(Checkout)
  checkout(ctx: StateContext<OrderStateModel>, action: Checkout) {
    // Checkout Logic Here
  }

  @Action(PlaceOrder)
  placeOrder(ctx: StateContext<OrderStateModel>, action: PlaceOrder) {
    // Place Order Logic Here
  }

  @Action(UpdateOrderStatus)
  updateOrderStatus(ctx: StateContext<OrderStateModel>, { id, payload }: UpdateOrderStatus) {
    // Update Order Status Logic Here
  }

  @Action(DownloadInvoice)
  downloadInvoice(ctx: StateContext<OrderStateModel>, action: DownloadInvoice) {
    // Download Invoice Logic Here
  }

  @Action(Clear)
  clear(ctx: StateContext<OrderStateModel>) {
    const state = ctx.getState();
    ctx.patchState({
      ...state,
      selectedUser: null,
      checkout: null
    });
  }

}  