import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { Select2Data } from "ng-select2-component";
import { UpdateBadgeValue } from "../action/sidebar.action";
import { GetProducts, CreateProduct, EditProduct,
         UpdateProduct, UpdateProductStatus, ApproveProductStatus, DeleteProduct,
         DeleteAllProduct, ReplicateProduct, ExportProduct, ImportProduct,
         Download} from "../action/product.action";
import { Product, ProductModel, Variation } from "../../interface/product.interface";
import { ProductService } from "../../services/product.service";
import { NotificationService } from "../../services/notification.service";

export class ProductStateModel {
  product = {
    data: [] as Product[],
    total: 0
  }
  selectedProduct: Product | null;
  topSellingProducts: Product[]
}

@State<ProductStateModel>({
  name: "product",
  defaults: {
    product: {
      data: [],
      total: 0
    },
    selectedProduct: null,
    topSellingProducts: []
  },
})
@Injectable()
export class ProductState {

  constructor(private store: Store,
    private notificationService: NotificationService,
    private productService: ProductService) {}

  @Selector()
  static product(state: ProductStateModel) {
    return state.product;
  }

  @Selector()
  static products(state: ProductStateModel) {
    return state.product.data.filter(data => data.id !== state.selectedProduct?.id).map((res: Product) => {
      return { label: res?.name, value: res?.id, data: {
        type: res.type,
        name: res.name,
        slug: res.slug,
        stock_status: res.stock_status,
        image: res.product_thumbnail ? res.product_thumbnail.original_url : 'assets/images/product.png'
      }}
    })
  }

  @Selector()
  static digitalProducts(state: ProductStateModel) {
    let products: Select2Data = [];
    state.product.data.filter(data => data.id !== state.selectedProduct?.id && data.product_type == 'digital').map((res: Product) => {
      products.push({ label: res?.name, value: res?.id, data: {
        name: res.name,
        product_id: res?.id,
        variation_id: null,
        image: res.product_thumbnail ? res.product_thumbnail.original_url : 'assets/images/product.png'
      }});
      if(res?.variations?.length) {
        res.variations.map((variation: Variation) => {
          products.push({ label: variation?.name, value: variation?.id!, data: {
            name: variation.name,
            product_id: res?.id,
            variation_id: variation?.id,
            image: variation.variation_image ? variation.variation_image.original_url : 'assets/images/product.png'
          }});
        });
      }
    });
    return products;
  }

  @Selector()
  static selectedProduct(state: ProductStateModel) {
    return state.selectedProduct;
  }

  @Selector()
  static topSellingProducts(state: ProductStateModel) {
    return state.topSellingProducts;
  }

  @Action(GetProducts)
  getProducts(ctx: StateContext<ProductStateModel>, action: GetProducts) {
    return this.productService.getProducts(action.payload).pipe(
      tap({
        next: (result: ProductModel) => {
          let paginateProduct
          if(action.payload!['page'] && action.payload!['paginate']) {
            paginateProduct = result.data.map((product) => ({ ...product })).slice(
              (action.payload!['page'] - 1) * action.payload!['paginate'],
              (action.payload!['page']- 1) * action.payload!['paginate'] + action.payload!['paginate'],
            );
          } else {
            paginateProduct = result.data;
          }

          if(action?.payload!['top_selling']) {
            const state = ctx.getState();
            ctx.patchState({
              ...state,
              topSellingProducts: paginateProduct
            });
          } else {
            ctx.patchState({
              product: {
                data: paginateProduct,
                total: result?.total ? result?.total : paginateProduct?.length
              }
            });
          }
        },
        error: err => {
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateProduct)
  create(ctx: StateContext<ProductStateModel>, action: CreateProduct) {
    // Create Product Logic Here
  }

  @Action(EditProduct)
  edit(ctx: StateContext<ProductStateModel>, { id }: EditProduct) {
    return this.productService.getProducts().pipe(
      tap({
        next: results => {
          const state = ctx.getState();
          const result = results.data.find(product => product.id == id);
          ctx.patchState({
            ...state,
            selectedProduct: result
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateProduct)
  update(ctx: StateContext<ProductStateModel>, { payload, id }: UpdateProduct) {
    // Update Product Login Here
  }

  @Action(UpdateProductStatus)
  updateStatus(ctx: StateContext<ProductStateModel>, { id, status }: UpdateProductStatus) {
    // Update Product Status Login Here
  }

  @Action(ApproveProductStatus)
  approveStatus(ctx: StateContext<ProductStateModel>, { id, status }: ApproveProductStatus) {
    // Approve Product Status Login Here
  }

  @Action(DeleteProduct)
  delete(ctx: StateContext<ProductStateModel>, { id }: DeleteProduct) {
    // Delete Product Login Here
  }

  @Action(DeleteAllProduct)
  deleteAll(ctx: StateContext<ProductStateModel>, { ids }: DeleteAllProduct) {
    // Delete All Product Login Here
  }

  @Action(ReplicateProduct)
  replicateProduct(ctx: StateContext<ProductStateModel>, { ids }: ReplicateProduct) {
    // Replicate Product Login Here
  }

  @Action(ImportProduct)
  import(ctx: StateContext<ProductStateModel>, action: ImportProduct) {
    // Import Product Login Here
  }

  @Action(ExportProduct)
  export(ctx: StateContext<ProductStateModel>, action: ExportProduct) {
    // Export Product Login Here
  }

  @Action(Download)
  download(ctx: StateContext<ProductStateModel>, action: Download) {
    // Download Product Login Here
  }

}
