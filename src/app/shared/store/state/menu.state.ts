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
    return this.menuService.getMenu(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            menu: {
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

  @Action(CreateMenu)
  create(ctx: StateContext<MenuStateModel>, action: CreateMenu) {
    // Create Menu Logic Here
  }
   
  @Action(EditMenu)
  edit(ctx: StateContext<MenuStateModel>, { id }: EditMenu) {
    return this.menuService.getMenu().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(menu => menu.id == id);
          ctx.patchState({
            ...state,
            selectedMenu: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateMenu)
  update(ctx: StateContext<MenuStateModel>, { payload, id }: UpdateMenu) {
    // Update Menu Logic Here
  }

  @Action(UpdateSortMenu)
  updateShort(ctx: StateContext<MenuStateModel>, action: UpdateSortMenu) {
    // Update Short Logic Here
  }

  @Action(DeleteMenu)
  delete(ctx: StateContext<MenuStateModel>, { id }: DeleteMenu) {
    // Delete Menu Logic Here
  }

}