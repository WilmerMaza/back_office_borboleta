import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { SettingState } from '../../../shared/store/state/setting.state';
import { Observable } from 'rxjs';
import { Values } from '../../../shared/interface/setting.interface';
import { Router } from '@angular/router';
import { ForgotPassWord } from '../../../shared/store/action/auth.action';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from '../../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-forgot-password',
    imports: [TranslateModule, FormsModule, ReactiveFormsModule,
        AlertComponent, ButtonComponent, AsyncPipe
    ],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  public form: FormGroup;

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  constructor(private store: Store,
    public router: Router,
    public formBuilder: FormBuilder ) {
    this.form = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid) {
      this.store.dispatch(new ForgotPassWord(this.form.value)).subscribe({
        complete: () => {
          this.router.navigateByUrl('/auth/otp');
        }
      });
    }
  }

}
