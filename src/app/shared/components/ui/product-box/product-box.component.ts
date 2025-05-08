import { Component, Inject, inject, Input, PLATFORM_ID, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { CartAddOrUpdate } from '../../../interface/cart.interface';
import { Product } from '../../../interface/product.interface';
import { Values } from '../../../interface/setting.interface';
import { AddToCart } from '../../../store/action/cart.action';
import { SettingState } from '../../../store/state/setting.state';
import { AddToCartComponent } from './add-to-cart/add-to-cart.component';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencySymbolPipe } from '../../../pipe/currency-symbol.pipe';
import { ButtonComponent } from '../button/button.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-product-box',
    imports: [TranslateModule, CurrencySymbolPipe, ButtonComponent, AddToCartComponent],
    templateUrl: './product-box.component.html',
    styleUrl: './product-box.component.scss'
})
export class ProductBoxComponent {

  @Input() product: Product;

  @ViewChild("addToCartModal") addToCartModal: AddToCartComponent;

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  public cartItems: CartAddOrUpdate;
  public url: string;

  constructor(private store: Store, @Inject(PLATFORM_ID) private platformId: object) {
    this.setting$.subscribe(setting => {
      if(setting && setting.general) {
        this.url = setting.general.site_url;
      }
    });
  }

  addToCart(product: Product, qty: number) {
    const params: CartAddOrUpdate = {
      product_id: product?.id,
      product: product,
      variation_id: "",
      variation: null,
      quantity: qty
    }
    this.store.dispatch(new AddToCart(params));
  }

  externalProductLink(link: string) {
    if(isPlatformBrowser(this.platformId)) {
      if(link) {
        window.open(link, "_blank");
      }
    }
  }

}
