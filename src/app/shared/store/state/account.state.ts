import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetUserDetails, UpdateUserProfile, UpdateUserPassword, AccountClear, updateStoreDetails } from "../action/account.action";
import { AccountUser } from "./../../interface/account.interface";
import { AccountService } from "../../services/account.service";
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
          ctx.patchState({
            user: result,
            permissions: result.permission,
            roleName: result.role.name
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
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