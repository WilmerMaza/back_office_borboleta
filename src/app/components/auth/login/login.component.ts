import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { SettingState } from '../../../shared/store/state/setting.state';
import { Observable } from 'rxjs';
import { Values } from '../../../shared/interface/setting.interface';
import { Router, RouterModule } from '@angular/router';
import { Login } from '../../../shared/store/action/auth.action';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from '../../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-login',
    imports: [TranslateModule, FormsModule, ReactiveFormsModule,
        RouterModule, AlertComponent, ButtonComponent, AsyncPipe
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

  public form: FormGroup;

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  constructor(
    private store: Store,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  submit() {
    this.form.markAllAsTouched();
    if(this.form.valid) {
      this.store.dispatch(new Login(this.form.value)).subscribe({
          complete: () => {
            this.router.navigateByUrl('/dashboard');
          }
        }
      );
    }
  }

}
