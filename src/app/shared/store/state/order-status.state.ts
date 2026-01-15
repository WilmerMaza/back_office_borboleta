import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetOrderStatus } from "../action/order-status.action";
import { OrderStatus } from "../../interface/order-status.interface";
import { OrderStatusService } from "../../services/order-status.service";

export class OrderStatusStateModel {
   orderStatus = {
    data: [] as OrderStatus[],
    total: 0
  }
  selectedOrderStatus: OrderStatus | null;
}

@State<OrderStatusStateModel>({
  name: "orderStatus",
  defaults: {
   orderStatus: {
      data: [],
      total: 0
    },
    selectedOrderStatus: null
  },
})
@Injectable()
export class OrderStatusState {
  
  constructor(private orderStatusService: OrderStatusService) {}

   @Selector()
   static orderStatus(state: OrderStatusStateModel) {
      return state.orderStatus;
   }

   @Selector()
   static orderStatuses(state: OrderStatusStateModel) {
      return state.orderStatus.data
        .filter(res => res && res.id) // Filtrar elementos válidos
        .map(res => { 
          // Usar el nombre del estado, o generar desde slug si name es inválido
          let label: string;
          if (res?.name && 
              res.name.trim() !== '' && 
              res.name.toLowerCase() !== 'desconocido' &&
              res.name.toLowerCase() !== 'unknown') {
            label = res.name.replaceAll('_', ' ');
          } else if (res?.slug) {
            // Generar nombre desde slug si name no es válido
            label = res.slug.replace(/-/g, ' ').replace(/_/g, ' ');
          } else {
            label = 'Unknown';
          }
          
          // Capitalizar cada palabra
          label = label
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          return { label: label, value: res.id };
       });
   }

   @Selector()
   static selectedOrderStatus(state: OrderStatusStateModel) {
      return state.selectedOrderStatus;
   }

   @Action(GetOrderStatus)
   getOrderStatus(ctx: StateContext<OrderStatusStateModel>, action: GetOrderStatus) {
     return this.orderStatusService.getOrderStatus(action.payload).pipe(
       tap({
         next: result => { 
            ctx.patchState({
              orderStatus: {
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
 
}    