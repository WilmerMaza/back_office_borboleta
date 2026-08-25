import { Component, inject, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ShippingState } from '../../shared/store/state/shipping.state';
import { Observable, map } from 'rxjs';
import { Shipping, ShippingModel } from '../../shared/interface/shipping.interface';
import { ShippingCountryModalComponent } from './modal/shipping-country-modal/shipping-country-modal.component';
import { DeleteModalComponent } from '../../shared/components/ui/modal/delete-modal/delete-modal.component';
import { DeleteShipping, GetShippings } from '../../shared/store/action/shipping.action';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { NoDataComponent } from '../../shared/components/ui/no-data/no-data.component';

@Component({
    selector: 'app-shipping',
    imports: [CommonModule, RouterModule, TranslateModule,
        HasPermissionDirective, PageWrapperComponent, NoDataComponent,
        ShippingCountryModalComponent, DeleteModalComponent
    ],
    templateUrl: './shipping.component.html',
    styleUrl: './shipping.component.scss'
})
export class ShippingComponent {

  // Whitelist de países permitidos en la vista (códigos ISO 3166-1 alpha-2 y nombres en inglés/español).
  private readonly allowedCountryCodes: string[] = ['CO'];
  private readonly allowedCountryNames: string[] = ['colombia'];

  shipping$: Observable<ShippingModel> = inject(Store)
    .select(ShippingState.shipping)
    .pipe(
      map((shipping: ShippingModel) => {
        if (!shipping?.data?.length) return shipping;
        const filteredData = shipping.data.filter(item => this.isAllowedCountry(item));
        return { ...shipping, data: filteredData, total: filteredData.length };
      })
    ) as Observable<ShippingModel>;

  @ViewChild("countryShippingModal") CountryShippingModal: ShippingCountryModalComponent;
  @ViewChild("deleteModal") DeleteModal: DeleteModalComponent;

  constructor(private store: Store) {
    this.store.dispatch(new GetShippings());
  }

  delete(actionType: string, data: Shipping) {
    this.store.dispatch(new DeleteShipping(data?.id));
  }

  private isAllowedCountry(shipping: Shipping): boolean {
    const code = (shipping?.country?.iso_3166_2 ?? '').toString().toUpperCase();
    const name = (shipping?.country?.name ?? '').toString().trim().toLowerCase();
    return this.allowedCountryCodes.includes(code) || this.allowedCountryNames.includes(name);
  }

}
