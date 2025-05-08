import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { countryCodes } from '../../../shared/data/country-code';
import { Select, Store } from '@ngxs/store';
import { SettingState } from '../../../shared/store/state/setting.state';
import { Observable, map } from 'rxjs';
import { Values } from '../../../shared/interface/setting.interface';
import { CountryState } from '../../../shared/store/state/country.state';
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { Stores } from '../../../shared/interface/store.interface';
import { StoreState } from '../../../shared/store/state/store.state';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { CustomValidators } from '../../../shared/validator/password-match';
import { StateState } from '../../../shared/store/state/state.state';
import { CreateStore } from '../../../shared/store/action/store.action';
import { TranslateModule } from '@ngx-translate/core';
import { AlertComponent } from '../../../shared/components/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-register',
    imports: [TranslateModule, FormsModule, ReactiveFormsModule,
        Select2Module, RouterModule, CommonModule,
        AlertComponent, ButtonComponent
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {

  public form: FormGroup;
  public codes = countryCodes;

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;
  countries$: Observable<Select2Data> = inject(Store).select(CountryState.countries) as Observable<Select2Data>;
  store$: Observable<Stores> = inject(Store).select(StoreState.selectedStore) as Observable<Stores>;

  public states$: Observable<Select2Data >;
  public isBrowser: boolean;

  constructor(
    private store: Store,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.form = this.formBuilder.group({
      store_name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      country_id: new FormControl('', [Validators.required]),
      state_id: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required]),
      country_code: new FormControl('1', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      password_confirmation: new FormControl('', [Validators.required]),
      status: new FormControl(1),
    },{
      validator : CustomValidators.MatchValidator('password', 'password_confirmation')
    });
  }

  get passwordMatchError() {
    return (
      this.form.getError('mismatch') &&
      this.form.get('password_confirmation')?.touched
    );
  }

  countryChange(data: Select2UpdateEvent) {
    if(data && data?.value) {
      this.states$ = this.store
          .select(StateState.states)
          .pipe(map(filterFn => filterFn(+data?.value)));
      this.form.controls['state_id'].setValue('');
    } else {
      this.form.controls['state_id'].setValue('');
    }
  }

  submit() {
    this.form.markAllAsTouched();
    this.notificationService.notification = false;
    let action = new CreateStore(this.form.value);
    if(this.form.valid) {
      this.store.dispatch(action).subscribe({
        complete: () => {
          this.router.navigateByUrl('/auth/login')
        }
      });
    }
  }

}
