import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetUserDetails, UpdateUserProfile, UpdateUserPassword, AccountClear, updateStoreDetails } from "../action/account.action";
import { AccountUser } from "./../../interface/account.interface";
import { AccountService, AccountUserResponse } from "../../services/account.service";
import { NotificationService } from "../../services/notification.service";
import { Permission } from "../../interface/role.interface";

export class AccountStateModel {
  user: AccountUser | null |any;
  permissions: Permission[];
  roleName: string | null;
}

@State<AccountStateModel>({
  name: "account",
  defaults: {
    user: null,
    permissions: [],
    roleName: null
  },
})
@Injectable()
export class AccountState {

  constructor(private accountService: AccountService,
      private notificationService: NotificationService, 
      public router: Router) {}

  @Selector()
  static user(state: AccountStateModel) {
    return state.user;
  }

  @Selector()
  static permissions(state: AccountStateModel) {
    return state.permissions;
  }

  @Selector()
  static getRoleName(state: AccountStateModel) {
    return state.roleName;
  }

  @Action(GetUserDetails)
  getUserDetails(ctx: StateContext<AccountStateModel>) {
    return this.accountService.getUserDetails().pipe(
      tap({
        next: result => { 
          if (result.success) {
            // El backend devuelve 'permission' (singular) no 'permissions' (plural)
            const permissions = result.data.permission || result.data.permissions || [];
            
            const mappedPermissions = permissions.map(p => ({
              id: p.id,
              permission_id: p.id,
              name: p.name,
              guard_name: p.guard_name
            }));
            
            // El usuario está directamente en result.data, no en result.data.user
            const userData = {
              id: result.data.id,
              name: result.data.name,
              email: result.data.email,
              country_code: result.data.country_code,
              phone: result.data.phone,
              status: result.data.status,
              created_at: result.data.created_at
            };
            
            ctx.patchState({
              user: userData,
              permissions: mappedPermissions,
              roleName: result.data.role.name
            });
          }
        },
        error: err => { 
          console.error('Error obteniendo detalles del usuario:', err);
          this.notificationService.notification = true;
        }
      })
    );
  }

  @Action(UpdateUserProfile)
  updateProfile(ctx: StateContext<AccountStateModel>, { payload }: UpdateUserProfile) {
    // Update profile logic hre
  }

  @Action(UpdateUserPassword)
  updatePassword(ctx: StateContext<AccountStateModel>, { payload }: UpdateUserPassword) {
    // Update password logic hre
  }

  @Action(updateStoreDetails)
  updateStoreDetails(ctx: StateContext<AccountStateModel>, { payload }: updateStoreDetails) {
    // Update store details logic here
  }

  @Action(AccountClear)
  accountClear(ctx: StateContext<AccountStateModel>){
    ctx.patchState({
      user: null,
      permissions: [],
      roleName: null
    });
  }

}