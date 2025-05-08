import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { LicenseKeyService } from "../../services/license-key.service";
import { LicenseKey } from "../../interface/license-key.interface";
import { GetLicenseKeys, CreateLicenseKey, EditLicenseKey, UpdateLicenseKey, UpdateLicenseKeyStatus,
         DeleteLicenseKey, DeleteAllLicenseKey } from "../action/license-key.actions";

export class LicenseKeyStateModel {
  licenseKey = {
    data: [] as LicenseKey[],
    total: 0
  }
  selectedLicenseKey: LicenseKey | null;
}

@State<LicenseKeyStateModel>({
  name: "licenseKey",
  defaults: {
    licenseKey: {
      data: [],
      total: 0
    },
    selectedLicenseKey: null
  },
})
@Injectable()
export class LicenseKeysState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private licenseKeyServiceService: LicenseKeyService) {}

  @Selector()
  static licenseKey(state: LicenseKeyStateModel) {
    return state.licenseKey;
  }

  @Selector()
  static selectedLicenseKey(state: LicenseKeyStateModel) {
    return state.selectedLicenseKey;
  }

  @Action(GetLicenseKeys)
  getLicenseKeys(ctx: StateContext<LicenseKeyStateModel>, action: GetLicenseKeys) {
    return this.licenseKeyServiceService.getLicenseKeys(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            licenseKey: {
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

  @Action(CreateLicenseKey)
  create(ctx: StateContext<LicenseKeyStateModel>, action: CreateLicenseKey) {
    // Create License Key Logic Here
  }

  @Action(EditLicenseKey)
  edit(ctx: StateContext<LicenseKeyStateModel>, { id }: EditLicenseKey) {
    return this.licenseKeyServiceService.getLicenseKeys().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(key => key.id == id);

          ctx.patchState({
            ...state,
            selectedLicenseKey: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateLicenseKey)
  update(ctx: StateContext<LicenseKeyStateModel>, { payload, id }: UpdateLicenseKey) {
    // Update license key logic here
  }

  @Action(UpdateLicenseKeyStatus)
  updateStatus(ctx: StateContext<LicenseKeyStateModel>, { id, status }: UpdateLicenseKeyStatus) {
      // Update status license key logic here
  }

  @Action(DeleteLicenseKey)
  delete(ctx: StateContext<LicenseKeyStateModel>, { id }: DeleteLicenseKey) {
    // Delete license key logic here
  }

  @Action(DeleteAllLicenseKey)
  deleteAll(ctx: StateContext<LicenseKeyStateModel>, { ids }: DeleteAllLicenseKey) {
     // Delete all license key logic here
  }

}
