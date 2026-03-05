import { Component, inject, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ProductState } from '../../shared/store/state/product.state';
import { SettingState } from '../../shared/store/state/setting.state';
import { CategoryState } from '../../shared/store/state/category.state';
import { BrandState } from '../../shared/store/state/brand.state';
import { StoreState } from '../../shared/store/state/store.state';
import { AccountState } from '../../shared/store/state/account.state';
import { Observable } from 'rxjs';
import { Product, ProductModel } from '../../shared/interface/product.interface';
import { Values } from '../../shared/interface/setting.interface';
import { CategoryModel } from '../../shared/interface/category.interface';
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { AccountUser } from '../../shared/interface/account.interface';
import { Params } from '@angular/router';
import { TableClickedAction, TableConfig } from '../../shared/interface/table.interface';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NgbDate, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { GetCategories } from '../../shared/store/action/category.action';
import { GetBrands } from '../../shared/store/action/brand.action';
import { GetStores } from '../../shared/store/action/store.action';
import { GetProducts, UpdateProductDiscountBulk } from '../../shared/store/action/product.action';
import { TranslateModule } from '@ngx-translate/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { TableComponent } from '../../shared/components/ui/table/table.component';
import { AdvanceDropdownComponent } from '../../shared/components/ui/advance-dropdown/advance-dropdown.component';
import { FormFieldsComponent } from '../../shared/components/ui/form-fields/form-fields.component';

@Component({
  selector: 'app-discount',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbModule,
    Select2Module,
    PageWrapperComponent,
    TableComponent,
    AdvanceDropdownComponent,
    FormFieldsComponent
  ],
  templateUrl: './discount.component.html',
  styleUrl: './discount.component.scss'
})
export class DiscountComponent {

  product$: Observable<ProductModel> = inject(Store).select(ProductState.product);
  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;
  category$: Observable<CategoryModel> = inject(Store).select(CategoryState.category) as Observable<CategoryModel>;
  brand$: Observable<Select2Data> = inject(Store).select(BrandState.brands);
  store$: Observable<Select2Data> = inject(Store).select(StoreState.stores);
  user$: Observable<AccountUser> = inject(Store).select(AccountState.user);

  discountForm: FormGroup;

  public mainProductType: Select2Data = [
    { value: 'physical', label: 'Physical Product' },
    { value: 'digital', label: 'Digital Product' },
    { value: 'external', label: 'External/Affiliate product' }
  ];

  public filter: Params = {
    'search': '',
    'field': '',
    'category_ids': '',
    'brand_ids': '',
    'store_ids': '',
    'sort': '',
    'page': 1,
    'paginate': 15,
  };

  public open = true;
  public isBrowser: boolean;

  public fromDate: NgbDate | null = null;
  public toDate: NgbDate | null = null;

  public tableConfig: TableConfig = {
    columns: [
      { title: 'image', dataField: 'product_thumbnail', class: 'tbl-image', type: 'image', placeholder: 'assets/images/product.png' },
      { title: 'name', dataField: 'name', sortable: true, sort_direction: 'desc' },
      { title: 'sku', dataField: 'sku', sortable: true, sort_direction: 'desc' },
      { title: 'price', dataField: 'price', type: 'price', sortable: true, sort_direction: 'desc' },
      { title: 'current_discount', dataField: 'discount_display' },
      { title: 'stock', dataField: 'stock' },
      { title: 'store', dataField: 'store_name' },
    ],
    rowActions: [],
    data: [] as Product[],
    total: 0
  };

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    public formatter: NgbDateParserFormatter,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.discountForm = this.formBuilder.group({
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      is_sale_enable: [true],
      sale_starts_at: [null],
      sale_expired_at: [null]
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetCategories({ status: 1 }));
    this.store.dispatch(new GetBrands({ status: 1 }));
    this.store.dispatch(new GetStores({ status: 1 }));
    this.store.dispatch(new GetProducts(this.filter));

    this.product$.subscribe(product => {
      const products = product?.data?.filter((element: Product) => {
        element.stock = element.stock_status
          ? `<div class="status-${element.stock_status}"><span>${element.stock_status.replace(/_/g, ' ')}</span></div>`
          : '-';
        element.store_name = element?.store ? element?.store?.store_name : '-';

        if (!element.product_thumbnail && element.product_galleries?.length) {
          element.product_thumbnail = element.product_galleries[0];
        }

        (element as any).discount_display = element.is_sale_enable && element.discount
          ? `${element.discount}%`
          : '-';

        if (element.product_type === 'external') {
          (element as any).system_reserve = '1';
        }

        if (element.type === 'classified' && element.variations?.length) {
          const prices = element.variations.map(v =>
            v.discount ? v.price - (v.price * v.discount / 100) : v.price
          );
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          element.price = minPrice;
          element.sale_price = minPrice;
        }

        return element;
      });
      this.tableConfig.data = product ? products : [];
      this.tableConfig.total = product?.total ?? 0;
    });
  }

  onTableChange(data?: Params) {
    this.filter = { ...this.filter, ...data };
    this.store.dispatch(new GetProducts(this.filter));
  }

  applyFilter(data: Select2UpdateEvent) {
    this.filter['product_type'] = data?.value ?? null;
    if (!this.filter['product_type']) delete this.filter['product_type'];
    this.onTableChange(this.filter);
  }

  onActionClicked(action: TableClickedAction) {
    if (action.actionToPerform === 'applyDiscount' && action.data?.length) {
      this.applyDiscount(action.data as number[]);
    }
  }

  applyDiscount(productIds: number[]) {
    this.discountForm.markAllAsTouched();
    if (!this.discountForm.valid) return;

    const { discount, is_sale_enable, sale_starts_at, sale_expired_at } = this.discountForm.value;

    this.store.dispatch(new UpdateProductDiscountBulk({
      productIds,
      discount: Number(discount),
      is_sale_enable: !!is_sale_enable,
      sale_starts_at: sale_starts_at || null,
      sale_expired_at: sale_expired_at || null
    }));
  }

  onStartDateSelect(date: NgbDate) {
    this.fromDate = date;
    this.discountForm.patchValue({
      sale_starts_at: `${date.year}-${date.month}-${date.day}`
    });
  }

  onEndDateSelect(date: NgbDate) {
    this.toDate = date;
    this.discountForm.patchValue({
      sale_expired_at: `${date.year}-${date.month}-${date.day}`
    });
  }

  openFilter() {
    this.open = !this.open;
  }

  selectItem(data: number[]) {
    this.renderer.addClass(this.document.body, 'loader-none');
    this.filter['category_ids'] = Array.isArray(data) && data.length ? data.join() : [];
    this.onTableChange(this.filter);
  }

  filters(data: unknown, key: string) {
    this.renderer.addClass(this.document.body, 'loader-none');
    const value = (data as { value?: number[] })?.value;
    this.filter[key] = value ? value.join() : [];
    this.onTableChange(this.filter);
  }

}
