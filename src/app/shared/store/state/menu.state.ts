import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { MenuService } from "../../services/menu.service";
import { CreateMenu, DeleteMenu, EditMenu, GetMenu, UpdateMenu, UpdateSortMenu } from "../action/menu.action";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Router } from "@angular/router";
import { Menu } from "../../interface/menu.interface";
 

export class MenuStateModel {
  menu = {
    data: [] as Menu[],
    total: 0
  }
  selectedMenu: Menu | null;
}

@State<MenuStateModel>({
  name: "menu",
  defaults: {
    menu: {
      data: [],
      total: 0
    },
    selectedMenu: null
  },
})

@Injectable()
export class MenuState {

  constructor(private notificationService: NotificationService,
     private menuService: MenuService,
     private store: Store,
     private router: Router) {}

  @Selector()
  static menu(state: MenuStateModel) {
    return state.menu;
  }

  @Selector()
  static selectedMenu(state: MenuStateModel) {
    return state.selectedMenu;
  }

  @Action(GetMenu)
  getMenu(ctx: StateContext<MenuStateModel>, action: GetMenu) {
    console.log('🔍 [MENU] GetMenu - Payload:', action.payload);
    return this.menuService.getMenu(action.payload).pipe(
      tap({
        next: result => { 
          console.log('✅ [MENU] GetMenu - Response completa:', result);
          console.log('📊 [MENU] GetMenu - result.data:', result.data);
          console.log('📊 [MENU] GetMenu - result.total:', result?.total);
          ctx.patchState({
            menu: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length
            }
          });
        },
        error: err => { 
          console.error('❌ [MENU] GetMenu - Error:', err);
          console.error('❌ [MENU] GetMenu - Error details:', err?.error);
          this.notificationService.showError(err?.error?.message || 'Error al obtener los menús');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateMenu)
  create(ctx: StateContext<MenuStateModel>, action: CreateMenu) {
    return this.menuService.createMenu(action.payload).pipe(
      tap({
        next: (response: any) => {
          const newMenu = response?.data || response;
          const state = ctx.getState();
          ctx.setState({
            ...state,
            menu: {
              data: [...state.menu.data, newMenu],
              total: state.menu.total + 1
            }
          });
          this.notificationService.showSuccess(response?.message || 'Menú creado exitosamente');
          this.store.dispatch(new GetMenu());
        },
        error: err => {
          console.error('❌ [MENU] CreateMenu - Error:', err);
          this.notificationService.showError(err?.error?.message || 'Error al crear el menú');
          throw new Error(err?.error?.message);
        }
      })
    );
  }
   
  @Action(EditMenu)
  edit(ctx: StateContext<MenuStateModel>, { id }: EditMenu) {
    return this.menuService.getMenuById(id).pipe(
      tap({
        next: (result: any) => { 
          const state = ctx.getState();
          const menu = (result as any)?.data || result;
          ctx.patchState({
            ...state,
            selectedMenu: menu
          });
        },
        error: err => { 
          console.error('❌ [MENU] EditMenu - Error:', err);
          this.notificationService.showError(err?.error?.message || 'Error al obtener el menú');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateMenu)
  update(ctx: StateContext<MenuStateModel>, { payload, id }: UpdateMenu) {
    return this.menuService.updateMenu(payload, id).pipe(
      tap({
        next: (response: any) => {
          const updatedMenu = response?.data || response;
          const state = ctx.getState();
          const updatedData = state.menu.data.map(menu => 
            menu.id === id ? updatedMenu : menu
          );
          
          ctx.setState({
            ...state,
            menu: {
              data: updatedData,
              total: state.menu.total
            },
            selectedMenu: updatedMenu
          });
          
          this.notificationService.showSuccess(response?.message || 'Menú actualizado exitosamente');
          this.store.dispatch(new GetMenu());
        },
        error: err => {
          console.error('❌ [MENU] UpdateMenu - Error:', err);
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el menú');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateSortMenu)
  updateShort(ctx: StateContext<MenuStateModel>, action: UpdateSortMenu) {
    // El payload ya viene con { menus: [...] } desde el componente
    return this.menuService.updateMenuSort(action.payload).pipe(
      tap({
        next: (response: any) => {
          this.notificationService.showSuccess(response?.message || 'Orden de menús actualizado exitosamente');
          this.store.dispatch(new GetMenu());
        },
        error: err => {
          console.error('❌ [MENU] UpdateSortMenu - Error:', err);
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el orden de los menús');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteMenu)
  delete(ctx: StateContext<MenuStateModel>, { id }: DeleteMenu) {
    return this.menuService.deleteMenu(id).pipe(
      tap({
        next: (response: any) => {
          const state = ctx.getState();
          const filteredData = state.menu.data.filter(menu => menu.id !== id);
          
          ctx.setState({
            ...state,
            menu: {
              data: filteredData,
              total: state.menu.total - 1
            },
            selectedMenu: null
          });
          
          this.notificationService.showSuccess(response?.message || 'Menú eliminado exitosamente');
          this.store.dispatch(new GetMenu());
        },
        error: err => {
          console.error('❌ [MENU] DeleteMenu - Error:', err);
          this.notificationService.showError(err?.error?.message || 'Error al eliminar el menú');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

}