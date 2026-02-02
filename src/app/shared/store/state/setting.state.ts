import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { SettingService } from "../../services/setting.service";
import { ErrorService } from "../../services/error.service";
import { GetAppSettingOption, GetSettingOption, TestEmail, UpdateAppSettingOption, UpdateSettingOption } from "../action/setting.action";
import { AppValues, Values } from "../../interface/setting.interface";
import { HttpErrorResponse } from "@angular/common/http";

export class SettingStateModel {
  setting: Values | null;
  appSetting: AppValues | null;
}

@State<SettingStateModel>({
  name: "setting",
  defaults: {
    setting: null,
    appSetting: null
  }
})
@Injectable()
export class SettingState {

  constructor(
    private settingService: SettingService, 
    private notificationService: NotificationService,
    private errorService: ErrorService
  ) {}
  
  @Selector()
  static setting(state: SettingStateModel) {
    return state.setting;
  }
  
  @Selector()
  static appSetting(state: SettingStateModel) {
    return state.appSetting;
  }

  @Action(GetSettingOption)
  getSettingOptions(ctx: StateContext<SettingStateModel>) {
    return this.settingService.getSettingOption().pipe(
      tap({
        next: (result) => {
          // Solo actualizar el estado si hay valores válidos
          if (result && result.values) {
            ctx.patchState({
              setting: result.values,
            });
          } else {
            // Si no hay valores, establecer null para indicar que no hay configuración
            // NO mostrar ningún log - silenciar completamente
            ctx.patchState({
              setting: null,
            });
          }
        },
        error: (err: HttpErrorResponse | Error) => {
          // Establecer el estado como null para indicar que no hay configuración disponible
          // NO mostrar ningún log ni error - silenciar completamente
          // El servicio ya maneja el caso cuando el archivo no existe
          ctx.patchState({
            setting: null,
          });
        },
      })
    );
  }

  @Action(UpdateSettingOption)
  updateSettingOption(ctx: StateContext<SettingStateModel>, action: UpdateSettingOption) {
    // Update Setting Option Logic Here
  }
 
  @Action(TestEmail)
  TestMailSetting(ctx: StateContext<SettingStateModel>, action: TestEmail) {
    // Mail Testing Logic Here 
  }

  @Action(UpdateAppSettingOption)
  UpdateAppSettingOption(ctx: StateContext<SettingStateModel>, action: UpdateAppSettingOption) {
    // Update App Setting Logic Here
  }
}
