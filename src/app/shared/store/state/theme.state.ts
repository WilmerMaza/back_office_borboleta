import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Themes } from "../../interface/theme.interface";
import { ThemeService } from "../../services/theme.service";
import { GetHomePage, GetThemes, UpdateHomePage, UpdateTheme } from "../action/theme.action";

export class ThemesStateModel {
  themes = {
    data: [] as Themes[],
   }
   homePage: any;
}

@State<ThemesStateModel>({
  name: "theme",
  defaults: {
   themes: {
      data: []
   },
   homePage: null
  },
})
@Injectable()
export class ThemeState {

  constructor(private themeService: ThemeService, 
    public notificationService: NotificationService) {}

  @Selector()
  static themes(state: ThemesStateModel) {
    return state.themes;
  }

  @Selector()
  static homePage(state: ThemesStateModel) {
    return state.homePage;
  }

  @Action(GetThemes)
  getThemes(ctx: StateContext<ThemesStateModel>) {
    return this.themeService.getThemes().pipe(
      tap({
        next: (result) => {
         ctx.patchState({
            themes: {
               data: result.data
            },
         });
        },
        error: (err) => {
          throw new Error(err?.error?.message);
        },
      })
    );
  }

  @Action(UpdateTheme)
  update(ctx: StateContext<ThemesStateModel>, { id, status }: UpdateTheme) {
    // Update Theme Logic Here
  }


 @Action(GetHomePage)
 getHomePage(ctx: StateContext<ThemesStateModel>, action: GetHomePage) {
   return this.themeService.getHomePage(action?.slug?.slug).pipe(
     tap({
       next: (result: any) => {
        // Extraer los valores y el ID del backend
        const homePageData = {
          id: result?.id || result?._id || result?.data?.id || 1,
          ...(result?.values || result?.data?.values || result)
        };
        
        ctx.patchState({
          homePage: homePageData
        });
       },
       error: (err) => {
         throw new Error(err?.error?.message);
       }
     })
   );
 }


 @Action(UpdateHomePage)
  updateHomePage(ctx: StateContext<ThemesStateModel>, action: UpdateHomePage) {
    return this.themeService.updateHomePage(action.id, action.payload).pipe(
      tap({
        next: (result) => {
          this.notificationService.showSuccess(result?.message || 'Configuración guardada exitosamente');
          
          // Actualizar el estado local
          ctx.patchState({
            homePage: result.data?.values || action.payload
          });
        },
        error: (err) => {
          this.notificationService.showError(err?.error?.message || 'Error al guardar la configuración');
          throw new Error(err?.error?.message);
        }
      })
    );
  }  

}