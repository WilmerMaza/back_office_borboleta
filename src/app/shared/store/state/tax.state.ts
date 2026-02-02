import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetTaxes, CreateTax, EditTax, 
         UpdateTax, UpdateTaxStatus, DeleteTax, 
         DeleteAllTax } from "../action/tax.action";
import { Tax } from "../../interface/tax.interface";
import { TaxService } from "../../services/tax.service";
import { NotificationService } from "../../services/notification.service";

export class TaxStateModel {
  tax = {
    data: [] as Tax[],
    total: 0
  }
  selectedTax: Tax | null;
}

@State<TaxStateModel>({
  name: "tax",
  defaults: {
    tax: {
      data: [],
      total: 0
    },
    selectedTax: null
  },
})
@Injectable()
export class TaxState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private taxService: TaxService) {}

  @Selector()
  static tax(state: TaxStateModel) {
    return state.tax;
  }

  @Selector()
  static taxes(state: TaxStateModel) {
    return state.tax.data.map((tax: Tax) => {
      return { label: tax?.name, value: tax?.id }
    });
  }

  @Selector()
  static selectedTax(state: TaxStateModel) {
    return state.selectedTax;
  }

  @Action(GetTaxes)
  getTaxes(ctx: StateContext<TaxStateModel>, action: GetTaxes) {
    console.log('🔍 [TAX] GetTaxes - Payload:', action.payload);
    return this.taxService.getTaxes(action.payload).pipe(
      tap({
        next: result => { 
          console.log('✅ [TAX] GetTaxes - Response completa:', result);
          console.log('📊 [TAX] GetTaxes - result.data:', result.data);
          console.log('📊 [TAX] GetTaxes - result.total:', result?.total);
          console.log('📊 [TAX] GetTaxes - result.current_page:', (result as any)?.current_page);
          console.log('📊 [TAX] GetTaxes - result.per_page:', (result as any)?.per_page);
          ctx.patchState({
            tax: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length
            }
          });
        },
        error: err => { 
          console.error('❌ [TAX] GetTaxes - Error:', err);
          console.error('❌ [TAX] GetTaxes - Error details:', err?.error);
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateTax)
  create(ctx: StateContext<TaxStateModel>, action: CreateTax) {
    console.log('🔍 [TAX] CreateTax - Payload:', action.payload);
    return this.taxService.createTax(action.payload).pipe(
      tap({
        next: (response: any) => {
          console.log('✅ [TAX] CreateTax - Response completa:', response);
          console.log('📊 [TAX] CreateTax - response.data:', response?.data);
          console.log('📊 [TAX] CreateTax - response.message:', response?.message);
          const newTax = response?.data || response;
          console.log('📊 [TAX] CreateTax - NewTax final:', newTax);
          const state = ctx.getState();
          ctx.setState({
            ...state,
            tax: {
              data: [...state.tax.data, newTax],
              total: state.tax.total + 1
            }
          });
          this.notificationService.showSuccess(response?.message || 'Impuesto creado exitosamente');
          this.store.dispatch(new GetTaxes());
        },
        error: err => {
          console.error('❌ [TAX] CreateTax - Error:', err);
          console.error('❌ [TAX] CreateTax - Error details:', err?.error);
          this.notificationService.showError(err?.error?.message || 'Error al crear el impuesto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(EditTax)
  edit(ctx: StateContext<TaxStateModel>, { id }: EditTax) {
    console.log('🔍 [TAX] EditTax - ID:', id);
    return this.taxService.getTaxById(id).pipe(
      tap({
        next: (result: any) => { 
          console.log('✅ [TAX] EditTax - Response completa:', result);
          console.log('📊 [TAX] EditTax - result.data:', (result as any)?.data);
          console.log('📊 [TAX] EditTax - result (directo):', result);
          const state = ctx.getState();
          const tax = (result as any)?.data || result;
          console.log('📊 [TAX] EditTax - Tax final a usar:', tax);
          ctx.patchState({
            ...state,
            selectedTax: tax
          });
        },
        error: err => { 
          console.error('❌ [TAX] EditTax - Error:', err);
          console.error('❌ [TAX] EditTax - Error details:', err?.error);
          this.notificationService.showError(err?.error?.message || 'Error al obtener el impuesto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateTax)
  update(ctx: StateContext<TaxStateModel>, { payload, id }: UpdateTax) {
    console.log('🔍 [TAX] UpdateTax - ID:', id, 'Payload:', payload);
    return this.taxService.updateTax(payload, id).pipe(
      tap({
        next: (response: any) => {
          console.log('✅ [TAX] UpdateTax - Response completa:', response);
          console.log('📊 [TAX] UpdateTax - response.data:', response?.data);
          const updatedTax = response?.data || response;
          console.log('📊 [TAX] UpdateTax - UpdatedTax final:', updatedTax);
          const state = ctx.getState();
          const updatedData = state.tax.data.map(tax => 
            tax.id === id ? updatedTax : tax
          );
          
          ctx.setState({
            ...state,
            tax: {
              data: updatedData,
              total: state.tax.total
            },
            selectedTax: updatedTax
          });
          
          this.notificationService.showSuccess(response?.message || 'Impuesto actualizado exitosamente');
          this.store.dispatch(new GetTaxes());
        },
        error: err => {
          console.error('❌ [TAX] UpdateTax - Error:', err);
          console.error('❌ [TAX] UpdateTax - Error details:', err?.error);
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el impuesto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateTaxStatus)
  updateStatus(ctx: StateContext<TaxStateModel>, { id, status }: UpdateTaxStatus) {
    return this.taxService.updateTaxStatus(id, status).pipe(
      tap({
        next: (response: any) => {
          const updatedTax = response?.data || response;
          const state = ctx.getState();
          const updatedData = state.tax.data.map(tax => 
            tax.id === id ? { ...tax, status: updatedTax.status || status } : tax
          );
          
          ctx.setState({
            ...state,
            tax: {
              data: updatedData,
              total: state.tax.total
            }
          });
          
          this.notificationService.showSuccess(response?.message || 'Estado del impuesto actualizado exitosamente');
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el estado del impuesto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteTax)
  delete(ctx: StateContext<TaxStateModel>, { id }: DeleteTax) {
    return this.taxService.deleteTax(id).pipe(
      tap({
        next: (response: any) => {
          const state = ctx.getState();
          const filteredData = state.tax.data.filter(tax => tax.id !== id);
          
          ctx.setState({
            ...state,
            tax: {
              data: filteredData,
              total: state.tax.total - 1
            },
            selectedTax: null
          });
          
          this.notificationService.showSuccess(response?.message || 'Impuesto eliminado exitosamente');
          this.store.dispatch(new GetTaxes());
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al eliminar el impuesto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteAllTax)
  deleteAll(ctx: StateContext<TaxStateModel>, { ids }: DeleteAllTax) {
    return this.taxService.deleteMultipleTaxes(ids).pipe(
      tap({
        next: (response: any) => {
          const state = ctx.getState();
          const filteredData = state.tax.data.filter(tax => !ids.includes(tax.id));
          
          ctx.setState({
            ...state,
            tax: {
              data: filteredData,
              total: state.tax.total - ids.length
            },
            selectedTax: null
          });
          
          this.notificationService.showSuccess(response?.message || `${ids.length} impuestos eliminados exitosamente`);
          this.store.dispatch(new GetTaxes());
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al eliminar los impuestos');
          throw new Error(err?.error?.message);
        }
      })
    );
  }
  

}
