import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Params } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Select2, Select2Data, Select2Module, Select2SearchEvent } from 'ng-select2-component';
import { Observable, Subject, debounceTime, forkJoin } from 'rxjs';
import { PageWrapperComponent } from '../../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { FormFieldsComponent } from '../../../shared/components/ui/form-fields/form-fields.component';
import { ImageUploadComponent } from '../../../shared/components/ui/image-upload/image-upload.component';
import { LinkComponent } from '../../../shared/components/ui/link/link.component';
import { mediaConfig } from '../../../shared/data/media-config';
import { HasPermissionDirective } from '../../../shared/directive/has-permission.directive';
import { CategoryModel } from '../../../shared/interface/category.interface';
import { Banners, Surfboard } from '../../../shared/interface/theme.interface';
import { GetBlogs } from '../../../shared/store/action/blog.action';
import { GetBrands } from '../../../shared/store/action/brand.action';
import { GetCategories } from '../../../shared/store/action/category.action';
import { GetProducts } from '../../../shared/store/action/product.action';
import { GetHomePage, UpdateHomePage } from '../../../shared/store/action/theme.action';
import { BlogState } from '../../../shared/store/state/blog.state';
import { BrandState } from '../../../shared/store/state/brand.state';
import { CategoryState } from '../../../shared/store/state/category.state';
import { ProductState } from '../../../shared/store/state/product.state';
import { ThemeState } from '../../../shared/store/state/theme.state';
import { AdvanceDropdownComponent } from '../../../shared/components/ui/advance-dropdown/advance-dropdown.component';

@Component({
    selector: 'app-surfboard',
    imports: [CommonModule, TranslateModule, FormsModule,
        ReactiveFormsModule, Select2Module, HasPermissionDirective,
        NgbModule, PageWrapperComponent, ButtonComponent,
        FormFieldsComponent, LinkComponent, ImageUploadComponent,
        AdvanceDropdownComponent],
    templateUrl: './surfboard.component.html',
    styleUrl: './surfboard.component.scss'
})
export class SurfboardComponent {

  home_page$: Observable<Surfboard> = inject(Store).select(ThemeState.homePage);
  product$: Observable<Select2Data> = inject(Store).select(ProductState.products);
  category$: Observable<CategoryModel> = inject(Store).select(CategoryState.category) as Observable<CategoryModel>;
  blogs$: Observable<Select2Data> = inject(Store).select(BlogState.blogs);
  brand$: Observable<Select2Data> = inject(Store).select(BrandState.brands);

  public form: FormGroup;
  public page_data: Surfboard;
  public active = 'home_banner';
  public selectedCategories: number[] = [];
  public selectedProductCategories: number[] = [];
  public collectionBanner = 1;
  public sliderProducts = 1;
  private search = new Subject<string>();
  public filter = {
    'status': 1,
    'search': '',
    'paginate': 15,
    'ids': '',
    'with_union_products': 0,
    'is_approved': 1
  };
  public mediaConfig = mediaConfig;
  public isBrowser: boolean;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.form = new FormGroup({
      content: new FormGroup({
        home_banner: new FormGroup({
          status: new FormControl(true),
          banners: new FormArray([]),
        }),
        categories:  new FormGroup({
          status: new FormControl(true),
          title: new FormControl(''),
          category_ids: new FormControl([])
        }),
        products_list: new FormGroup({
          status: new FormControl(true),
          title: new FormControl(''),
          tag: new FormControl(''),
          product_ids: new FormControl([])
        }),
        offer_banner: new FormGroup({
          status: new FormControl(true),
          banners: new FormArray([]),
        }),
        category_product: new FormGroup({
          tag: new FormControl(''),
          title: new FormControl(''),
          category_ids: new FormControl([]),
          status: new FormControl(true),
        }),
        social_media: new FormGroup({
          title: new FormControl(''),
          status: new FormControl(true),
          banners: new FormArray([])
        }),
        brand: new FormGroup({
          brand_ids: new FormControl(''),
          status: new FormControl(false),
        }),
        products_ids: new FormControl([]),
      }),
      slug: new FormControl('surfboard'),
    });
  }

  ngOnInit() {
    const home_page$ = this.store.dispatch(new GetHomePage({ slug: "surfboard" }));
    const categories$ = this.store.dispatch(new GetCategories({ status: 1, type: 'product' }));
    const blogs$ = this.store.dispatch(new GetBlogs({ status: 1 }));
    const brand$ = this.store.dispatch(new GetBrands({ status: 1 }));
    forkJoin([home_page$, categories$, brand$]).subscribe({
      complete: () => {
        this.store.select(ThemeState.homePage).subscribe({
          next: (homePage) => {
            if (homePage?.content?.products_ids) {
              this.filter['paginate'] = homePage?.content?.products_ids?.length >= 15 ? homePage?.content?.products_ids?.length : 15;
              this.filter['ids'] = homePage?.content?.products_ids?.join();
              this.filter['with_union_products'] = homePage?.content?.products_ids?.length ? homePage?.content?.products_ids?.length >= 15 ? 0 : 1 : 0;
            }
            this.store.dispatch(new GetProducts(this.filter)).subscribe({
              complete: () => {
                this.patchForm();
              }
            });
          }
        });
      }
    });

    this.search
      .pipe(debounceTime(300)) // Adjust the debounce time as needed (in milliseconds)
      .subscribe((inputValue) => {
        this.filter['search'] = inputValue;
        this.getProducts(this.filter)
        this.renderer.addClass(this.document.body, 'loader-none');
      });
  }

  patchForm() {
    this.home_page$.subscribe(homePage => {
      this.page_data = homePage;
      this.selectedCategories = homePage?.content?.categories?.category_ids;
      this.selectedProductCategories = homePage?.content?.category_product?.category_ids;
      this.form.patchValue({
        content: {
          home_banner: {
            status: homePage?.content?.home_banner?.status,
          },
          categories: {
            status: homePage?.content?.categories?.status,
            title: homePage?.content?.categories?.title,
            category_ids: homePage?.content?.categories?.category_ids
          },
          products_list: {
            tag: homePage?.content?.products_list?.tag,
            title: homePage?.content?.products_list?.title,
            product_ids: homePage?.content?.products_list?.product_ids,
            status: homePage?.content?.products_list?.status,
          },
          offer_banner: {
            status: homePage?.content?.offer_banner?.status,
          },
          category_product: {
            tag: homePage?.content?.category_product?.tag,
            title: homePage?.content?.category_product?.title,
            category_ids: homePage?.content?.category_product?.category_ids,
            status: homePage?.content?.category_product?.status,
          },
          social_media: {
            title: homePage?.content?.social_media?.title,
            status: homePage?.content?.social_media?.status,
          },
          brand: {
            brand_ids: homePage?.content?.brand?.brand_ids,
            status: homePage?.content?.brand?.status,
          },
          products_ids: homePage?.content?.products_ids,
        },
        slug: homePage?.slug,
      });

      this.homeBannersArray.clear();
      homePage?.content?.home_banner?.banners?.forEach((banner: Banners) =>
      this.homeBannersArray.push(
        this.formBuilder.group({
          redirect_link: new FormGroup({
            link: new FormControl(banner?.redirect_link?.link),
            link_type: new FormControl(banner?.redirect_link?.link_type),
          }),
          status: new FormControl(banner?.status),
          image_url: new FormControl(banner?.image_url),
        })
      ));

      this.offerBanner.clear();
      homePage?.content?.offer_banner?.banners?.forEach((banner: Banners) =>
      this.offerBanner.push(
        this.formBuilder.group({
          redirect_link: new FormGroup({
            link: new FormControl(banner?.redirect_link?.link),
            link_type: new FormControl(banner?.redirect_link?.link_type),
          }),
          status: new FormControl(banner?.status),
          image_url: new FormControl(banner?.image_url),
        })
      ));

      this.socialMediaArray.clear();
      homePage?.content?.social_media?.banners?.forEach((banner: Banners) =>
      this.socialMediaArray.push(
        this.formBuilder.group({
          redirect_link: new FormGroup({
            link: new FormControl(banner?.redirect_link?.link),
            link_type: new FormControl(banner?.redirect_link?.link_type),
          }),
          status: new FormControl(banner?.status),
          image_url: new FormControl(banner?.image_url),
        })
      ));
    });

  }

  selectCategoryItem(data: Number[], key: string) {
    if (Array.isArray(data)) {
      this.form.get(key)?.setValue(data);
    }
  }

  getProducts(filter: Params) {
    this.filter['search'] = filter['search'];
    this.filter['ids'] = this.filter['search'].length ? '' : this.page_data?.content?.products_ids?.join()
    this.filter['paginate'] = this.page_data?.content?.products_ids?.length >= 15 ? this.page_data?.content?.products_ids?.length : 15;
    this.store.dispatch(new GetProducts(this.filter));
    this.renderer.addClass(this.document.body, 'loader-none');
  }

  productDropdown(event: Select2) {
    if (event['innerSearchText']) {
      this.search.next('');
      this.getProducts(this.filter);
    }
  }

  searchProduct(event: Select2SearchEvent) {
    this.search.next(event.search);
  }

  get homeBannersArray(): FormArray {
    return this.form.get('content.home_banner.banners') as FormArray
  }

  get offerBanner(): FormArray {
    return this.form.get('content.offer_banner.banners') as FormArray
  }

  get socialMediaArray(): FormArray {
    return this.form.get('content.social_media.banners') as FormArray
  }

  addHomeBanner(event: Event) {
    event.preventDefault();
    this.homeBannersArray.push(
      this.formBuilder.group({
        redirect_link: new FormGroup({
          link: new FormControl(''),
          link_type: new FormControl(''),
          product_ids: new FormControl(''),
        }),
        image_url: new FormControl(),
        status: new FormControl(true),
      })
    );
  }

  addOfferBanner(event: Event) {
    event.preventDefault();
    this.offerBanner.push(
      this.formBuilder.group({
        redirect_link: new FormGroup({
          link: new FormControl(''),
          link_type: new FormControl(''),
          product_ids: new FormControl(''),
        }),
        image_url: new FormControl(),
        status: new FormControl(true),
      })
    );
  }

  addSocialMediaBanner(event: Event) {
    event.preventDefault();
    this.socialMediaArray.push(
      this.formBuilder.group({
        redirect_link: new FormGroup({
          link: new FormControl(''),
          link_type: new FormControl(''),
        }),
        image_url: new FormControl(),
        status: new FormControl(true),
      })
    );
  }

  removeHomeBanner(index: number) {
    if(this.homeBannersArray.length <= 1) return
      this.homeBannersArray.removeAt(index);
  }


  removeOfferBanner(index: number) {
    if(this.offerBanner.length <= 1) return
      this.offerBanner.removeAt(index);
  }

  removeSocialMediaBanner(index: number) {
    if(this.socialMediaArray.length <= 1) return
      this.socialMediaArray.removeAt(index);
  }

  selectImage(url: string, key: string) {
    this.form.get(key)?.setValue(url ? url : null)
  }

  selectHomeBannerImage(url: string, index: number){
    this.homeBannersArray.at(index).get('image_url')?.setValue(url ? url : null);
  }

  selectOfferBannerImage(url: string, index: number) {
    this.offerBanner.at(index).get('image_url')?.setValue(url ? url : null);
  }

  selectSocialMediaImage(url: string, index: number){
    this.socialMediaArray.at(index).get('image_url')?.setValue(url ? url : null);
  }

  // Merge Products Ids
  concatDynamicProductKeys(obj: Surfboard) {
    const result: number[] = [];
    function traverse(obj: any) {
      for (const key in obj) {
        if (key === 'product_ids' && Array.isArray(obj[key])) {
          result.push(...obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        } else {
          if (key === 'product_ids' && obj.product_ids) {
            result.push(obj.product_ids)
          };
        }
      }
    }
    traverse(obj);
    return result;
  }

  submit() {
    const productIds = Array.from(new Set(this.concatDynamicProductKeys(this.form.value)));
    this.form.get('content.products_ids')?.setValue(productIds);

    if (this.form.valid) {
      this.store.dispatch(new UpdateHomePage(this.page_data.id, this.form.value));
    }
  }
}
