import { Component, Inject, inject, Input, OnChanges, PLATFORM_ID, ViewChild } from '@angular/core';
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
export class ProductBoxComponent implements OnChanges {

  @Input() product: Product;

  @ViewChild("addToCartModal") addToCartModal: AddToCartComponent;

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  public cartItems: CartAddOrUpdate;
  public url: string;
  public displayPrice: { price: number; isRange: boolean; prefix: string } = { price: 0, isRange: false, prefix: '' };

  constructor(private store: Store, @Inject(PLATFORM_ID) private platformId: object) {
    this.setting$.subscribe(setting => {
      if(setting && setting.general) {
        this.url = setting.general.site_url;
      }
    });
  }

  ngOnChanges() {
    if (this.product) {
      this.displayPrice = this.getDisplayPrice(this.product);
    }
  }

  getDisplayPrice(product: Product): { price: number; isRange: boolean; prefix: string } {
    if (product.type === 'classified' && product.variations?.length) {
      const prices = product.variations.map(v => {
        const price = v.price ?? 0;
        const discount = v.discount ?? 0;
        const salePrice = v.sale_price;
        const finalPrice = (salePrice != null && salePrice > 0)
          ? salePrice
          : (discount ? price - (price * discount / 100) : price);
        return finalPrice;
      });
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      // Si todos tienen el mismo precio
      if (minPrice === maxPrice) {
        return { price: minPrice, isRange: false, prefix: '' };
      }
      
      // Si tienen precios diferentes
      return { price: minPrice, isRange: true, prefix: 'Desde' };
    }
    
    // Para productos simples
    return { 
      price: product.discount 
        ? product.price - (product.price * product.discount / 100)
        : product.sale_price || product.price,
      isRange: false,
      prefix: ''
    };
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
