import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { forkJoin, of, switchMap } from "rxjs";
import { tap } from "rxjs";
import { Select2Data } from "ng-select2-component";
import { UpdateBadgeValue } from "../action/sidebar.action";
import { GetProducts, CreateProduct, EditProduct,
         UpdateProduct, UpdateProductStatus, ApproveProductStatus, DeleteProduct,
         DeleteAllProduct, ReplicateProduct, ExportProduct, ImportProduct,
         Download, UpdateProductDiscountBulk} from "../action/product.action";
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
        price: res.price,
        sale_price: res.sale_price,
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
  createProduct(ctx: StateContext<ProductStateModel>, action: CreateProduct) {
    return this.productService.createProduct(action.payload).pipe(
      tap({
        next: (response: any) => {
          // Extraer el producto creado de la respuesta del backend
          const newProduct = response?.data?.product || response?.data || response;
          
          const state = ctx.getState();
          ctx.setState({
            ...state,
            product: {
              data: [...state.product.data, newProduct],
              total: state.product.total + 1
            }
          });
          
          this.notificationService.showSuccess(response?.message || 'Producto creado exitosamente');
        },
        error: (err) => {
          this.notificationService.showError(err?.error?.message || 'Error al crear el producto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(EditProduct)
  edit(ctx: StateContext<ProductStateModel>, { id }: EditProduct) {
    return this.productService.getProductById(id).pipe(
      tap({
        next: (result: any) => {
          const data = result?.data;
          let product: any;
          if (data?.product) {
            product = data.product;
          } else if (data) {
            product = data;
          } else {
            product = result;
          }

          const state = ctx.getState();
          ctx.patchState({
            ...state,
            selectedProduct: product
          });
        },
        error: err => {
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateProduct)
  update(ctx: StateContext<ProductStateModel>, action: UpdateProduct) {
    return this.productService.updateProduct(action.payload, action.id).pipe(
      tap({
        next: (result: any) => {
          // Extraer el producto actualizado de la respuesta del backend
          const updatedProduct = result?.data?.product || result?.data || result;
          
          const state = ctx.getState();
          ctx.patchState({
            product: {
              ...state.product,
              data: state.product.data.map(p => p.id === action.id ? updatedProduct : p)
            },
            selectedProduct: updatedProduct
          });
          
          this.notificationService.showSuccess(result?.message || 'Producto actualizado exitosamente');
        },
        error: (err) => {
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el producto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateProductStatus)
  updateStatus(ctx: StateContext<ProductStateModel>, { id, status }: UpdateProductStatus) {
    return this.productService.updateProductStatus(id, status).pipe(
      tap({
        next: () => {
          const state = ctx.getState();
          const updatedData = state.product.data.map(product => 
            product.id === id ? { ...product, status } : product
          );
          
          ctx.patchState({
            product: {
              ...state.product,
              data: updatedData
            }
          });
          
          this.notificationService.showSuccess(`Estado del producto ${status ? 'activado' : 'desactivado'} exitosamente`);
        },
        error: (err) => {
          this.notificationService.showError('Error al cambiar el estado del producto');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(ApproveProductStatus)
  approveStatus(ctx: StateContext<ProductStateModel>, { id, status }: ApproveProductStatus) {
    return this.productService.approveProduct(id, status).pipe(
      tap({
        next: () => {
          const state = ctx.getState();
          const updatedData = state.product.data.map(product => 
            product.id === id ? { ...product, is_approved: status } : product
          );
          
          ctx.patchState({
            product: {
              ...state.product,
              data: updatedData
            }
          });
          
          this.notificationService.showSuccess(`Producto ${status ? 'aprobado' : 'desaprobado'} exitosamente`);
        },
        error: (err) => {
          this.notificationService.showError('Error al cambiar el estado de aprobación');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateProductDiscountBulk)
  updateProductDiscountBulk(ctx: StateContext<ProductStateModel>, { payload }: UpdateProductDiscountBulk) {
    const { productIds, discount, is_sale_enable, sale_starts_at, sale_expired_at } = payload;
    const state = ctx.getState();

    const updates = productIds.map(id => {
      return this.productService.getProductById(id).pipe(
        switchMap((result: any) => {
          const product = result?.data?.product || result?.data || result;
          if (!product) return of(null);

          const salePrice = product.price
            ? (product.price - (product.price * discount / 100)).toFixed(2)
            : 0;

          let variations = product.variations;
          if (product.type === 'classified' && variations?.length) {
            variations = variations.map((v: Variation) => ({
              ...v,
              discount,
              sale_price: (v.price - (v.price * discount / 100)).toFixed(2)
            }));
          }

          const updatePayload: any = {
            discount,
            sale_price: salePrice,
            is_sale_enable,
            sale_starts_at: sale_starts_at || null,
            sale_expired_at: sale_expired_at || null
          };
          if (product.type === 'classified' && variations?.length) {
            updatePayload.variations = variations;
          }

          return this.productService.updateProduct(updatePayload as any, id);
        })
      );
    });

    return forkJoin(updates).pipe(
      tap({
        next: (results: any[]) => {
          const updatedProducts = results.filter(Boolean).map(r => r?.data?.product || r?.data || r);
          const updatedIds = new Set(updatedProducts.map((p: Product) => p.id));
          const currentState = ctx.getState();
          const newData = currentState.product.data.map((p: Product) =>
            updatedIds.has(p.id)
              ? updatedProducts.find((up: Product) => up.id === p.id) || p
              : p
          );
          ctx.patchState({
            product: {
              ...currentState.product,
              data: newData
            }
          });
          this.notificationService.showSuccess(
            `Descuento aplicado exitosamente a ${productIds.length} producto(s)`
          );
        },
        error: (err) => {
          this.notificationService.showError(
            err?.error?.message || 'Error al aplicar el descuento'
          );
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteProduct)
  delete(ctx: StateContext<ProductStateModel>, { id }: DeleteProduct) {
    return this.productService.deleteProduct(id).pipe(
      tap({
        next: () => {
          const state = ctx.getState();
          const filteredData = state.product.data.filter(product => product.id !== id);
          
          ctx.patchState({
            product: {
              data: filteredData,
              total: state.product.total - 1
            }
          });
          
          this.notificationService.showSuccess('Producto eliminado exitosamente');
        },
        error: (err) => {
          this.notificationService.showError('Error al eliminar el producto');
          throw new Error(err?.error?.message);
        }
      })
    );
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
