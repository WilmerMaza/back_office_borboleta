import { Injectable } from "@angular/core";
import { Store, State, Selector, Action, StateContext } from "@ngxs/store";
import { Router } from '@angular/router';
import { tap } from "rxjs/operators";
import { AuthService } from "../../services/auth.service";
import { ForgotPassWord, Login, VerifyEmailOtp, UpdatePassword, Logout, AuthClear } from "../action/auth.action";
import { AccountClear, GetUserDetails } from "../action/account.action";
import { GetBadges } from "../action/sidebar.action";
import { GetSettingOption } from "../action/setting.action";
import { GetNotification } from "../action/notification.action";
import { NotificationService } from "../../services/notification.service";

export interface AuthStateModel {
  email: string;
  token: string | number;
  access_token: string | null;
  permissions: [];
}

@State<AuthStateModel>({
  name: "auth",
  defaults: {
    email: '',
    token: '',
    access_token: '',
    permissions: [],
  },
})
@Injectable()
export class AuthState {
  
  constructor(private store: Store,
    public router: Router,
    private notificationService: NotificationService,
    private authService: AuthService) {}

  @Selector()
  static accessToken(state: AuthStateModel) {
    return state.access_token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel) {
    return !!state.access_token;
  }

  @Selector()
  static email(state: AuthStateModel) {
    return state.email;
  }

  @Selector()
  static token(state: AuthStateModel) {
    return state.token;
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    this.notificationService.notification = false;
    ctx.patchState({
      email: 'admin@example.com',
      token: '',
      access_token: '115|laravel_sanctum_mp1jyyMyKeE4qVsD1bKrnSycnmInkFXXIrxKv49w49d2a2c5',
      permissions: [],
    })
    this.store.dispatch(new GetUserDetails());
    this.store.dispatch(new GetBadges());
    this.store.dispatch(new GetNotification());
    this.store.dispatch(new GetSettingOption());
  }

  @Action(ForgotPassWord)
  forgotPassword(ctx: StateContext<AuthStateModel>, action: ForgotPassWord) {
    this.notificationService.notification = false;
    // Forgot Password Logic Here
  }

  @Action(VerifyEmailOtp)
  verifyEmail(ctx: StateContext<AuthStateModel>, action: VerifyEmailOtp) {
    this.notificationService.notification = false;
    // Verify Email Logic Here
  }

  @Action(UpdatePassword)
  updatePassword(ctx: StateContext<AuthStateModel>, action: UpdatePassword) {
    this.notificationService.notification = false;
    // Update Password Logic Here

  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    this.store.dispatch(new AuthClear()).subscribe({
      complete: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  @Action(AuthClear)
  authClear(ctx: StateContext<AuthStateModel>){
    ctx.patchState({
      email: '',
      token: '',
      access_token: null,
      permissions: [],
    });
    this.store.dispatch(new AccountClear());
  }

}
