import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetBrands, CreateBrand, EditBrand, 
         UpdateBrand, UpdateBrandStatus, DeleteBrand, 
         DeleteAllBrand, ExportBrand, ImportBrand } from "../action/brand.action";
import { Brand } from "../../interface/brand.interface";
import { BrandService } from "../../services/brand.service";
import { NotificationService } from "../../services/notification.service";

export class BrandStateModel {
  brand = {
    data: [] as Brand[],
    total: 0
  }
  selectedBrand: Brand | null;
}

@State<BrandStateModel>({
  name: "brand",
  defaults: {
    brand: {
      data: [],
      total: 0
    },
    selectedBrand: null
  },
})
@Injectable()
export class BrandState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private brandService: BrandService) {}

  @Selector()
  static brand(state: BrandStateModel) {
    return state.brand;
  }

  @Selector()
  static selectedBrand(state: BrandStateModel) {
    return state.selectedBrand;
  }

  @Selector()
  static brands(state: BrandStateModel) {
    return state.brand.data.map(res => { 
      return { label: res?.name, value: res?.id }
    });
  }

  @Action(GetBrands)
  getBrands(ctx: StateContext<BrandStateModel>, action: GetBrands) {
    return this.brandService.getBrands(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            brand: {
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

  @Action(CreateBrand)
  create(ctx: StateContext<BrandStateModel>, action: CreateBrand) {
    // Create Brand Logic Here
  }

  @Action(EditBrand)
  edit(ctx: StateContext<BrandStateModel>, { id }: EditBrand) {
    return this.brandService.getBrands().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(brand => brand.id == id);
          ctx.patchState({
            ...state,
            selectedBrand: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateBrand)
  update(ctx: StateContext<BrandStateModel>, { payload, id }: UpdateBrand) {
    // Update Brand Logic Here
  }

  @Action(UpdateBrandStatus)
  updateStatus(ctx: StateContext<BrandStateModel>, { id, status }: UpdateBrandStatus) {
    // Update Brand Status Logic Here
  }

  @Action(DeleteBrand)
  delete(ctx: StateContext<BrandStateModel>, { id }: DeleteBrand) {
    // Delete Brand Logic Here
  }

  @Action(DeleteAllBrand)
  deleteAll(ctx: StateContext<BrandStateModel>, { ids }: DeleteAllBrand) {
    // Delete All Brand Logic Here
  }

  @Action(ImportBrand)
  import(ctx: StateContext<BrandStateModel>, action: ImportBrand) {
    // Import Brand Logic Here
  }

  @Action(ExportBrand)
  export(ctx: StateContext<BrandStateModel>, action: ExportBrand) {
    // Export Brand Logic Here
  }

}
