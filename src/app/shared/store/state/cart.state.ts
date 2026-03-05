import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store, NgxsOnInit } from "@ngxs/store";
import { of, tap } from "rxjs";
import { AddToCart, AddToCartLocalStorage, ClearCart, DeleteCart, GetCartItems, LoadCartFromLocalStorage, ToggleSidebarCart, UpdateCart } from "../action/cart.action";
import { Cart } from "../../interface/cart.interface";
import { Product, Variation } from "../../interface/product.interface";
import { CartService } from "../../services/cart.service";
import { NotificationService } from "../../services/notification.service";

export interface CartStateModel {
  is_digital_only: boolean | number | null;
  items: Cart[];
  total: number;
  sidebarCartOpen: boolean;
}
  
@State<CartStateModel>({
  name: "cart",
  defaults: {
    is_digital_only: null,
    items: [],
    total: 0,
    sidebarCartOpen: false
  },
})
@Injectable()
export class CartState implements NgxsOnInit {
    
  constructor(private cartService: CartService,
    private notificationService: NotificationService,
    private store: Store) {}

  ngxsOnInit(ctx: StateContext<CartStateModel>) {
    this.loadFromLocalStorage(ctx);
  }

  @Selector()
  static cartItems(state: CartStateModel) {
    return state.items;
  }

  @Selector()
  static cartTotal(state: CartStateModel) {
    return state.total;
  }

  @Selector()
  static cartHasDigital(state: CartStateModel) {
    return state.is_digital_only;
  }

  @Selector()
  static sidebarCartOpen(state: CartStateModel) {
    return state.sidebarCartOpen;
  }

  private getEffectiveSalePrice(variation: Variation | null | undefined, product: Product | undefined): number {
    const target = variation || product;
    if (!target) return 0;
    const price = target.price ?? 0;
    const discount = target.discount ?? 0;
    const salePrice = target.sale_price;
    if (salePrice != null && salePrice > 0) return salePrice;
    return discount ? price - (price * discount / 100) : price;
  }

  @Action(GetCartItems)
  getCartItems(ctx: StateContext<CartStateModel>) {
    // La carga inicial se hace en ngxsOnInit()
    // Este método solo se usa para recargar manualmente si es necesario
    this.loadFromLocalStorageInternal(ctx);
    return of();
  }

  @Action(AddToCart)
  add(ctx: StateContext<CartStateModel>, action: AddToCart) {
     
    if(action.payload.id){
      this.store.dispatch(new UpdateCart(action.payload));
    } else {
      const salePrice = this.getEffectiveSalePrice(action.payload.variation, action.payload.product);
      let result: any = {
        items: [{
          id: Number(Math.floor(Math.random() * 10000).toString().padStart(4, '0')), // Generate Random Id
          quantity: action.payload.quantity,
          sub_total: salePrice * action.payload.quantity,
          product: action.payload.product!,
          product_id: action.payload.product_id,
          variation: action.payload.variation!,
          variation_id: action.payload ? action.payload.variation_id : null,
        }]
      }
  
      const state = ctx.getState();
      const cart = [...state.items];
      const index = cart.findIndex(item => item.id === result.items[0].id);
      
      let output = { ...state };
  
      if (index == -1) {
        output.items = [...state.items, ...result.items];
      }
  
      // Calculate Total
      output.total = output.items.reduce((prev, curr: Cart) => {
        return (prev + Number(curr.sub_total));
      }, 0);
  
      ctx.patchState(output);
      
      // Sincronizar con localStorage
      this.syncToLocalStorage(output.items, output.total, output.is_digital_only);
    }
  }

  @Action(AddToCartLocalStorage)
  addToLocalStorage(ctx: StateContext<CartStateModel>, action: AddToCartLocalStorage) {
    const salePrice = this.getEffectiveSalePrice(action.payload.variation, action.payload.product);
    let result: any = {
      items: [{
        id: Number(Math.floor(Math.random() * 10000).toString().padStart(4, '0')),
        quantity: action.payload.quantity,
        sub_total: salePrice * action.payload.quantity,
        product: action.payload.product!,
        product_id: action.payload.product_id,
        variation: action.payload.variation!,
        variation_id: action.payload ? action.payload.variation_id : null,
      }]
    }

    const state = ctx.getState();
    const cart = [...state.items];
    const index = cart.findIndex(item => item.id === result.items[0].id);
    
    let output = { ...state };

    if (index == -1) {
      output.items = [...state.items, ...result.items];
    }

    // Calculate Total
    output.total = output.items.reduce((prev, curr: Cart) => {
      return (prev + Number(curr.sub_total));
    }, 0);

    ctx.patchState(output);
    
    // Sincronizar con localStorage manualmente
    this.syncToLocalStorage(output.items, output.total, output.is_digital_only);
  }

  @Action(UpdateCart)
  update(ctx: StateContext<CartStateModel>, action: UpdateCart) {
    const state = ctx.getState();
    const cart = [...state.items];
    const index = cart.findIndex(item => item.id === action.payload.id);
    const productQty = cart[index]?.variation ? cart[index]?.variation?.quantity : cart[index]?.product?.quantity;

    if(productQty < cart[index]?.quantity + action?.payload.quantity) {
      this.notificationService.showError(`You cannot add more than ${productQty} items available in stock.`);
      return false;
    }

    cart[index].quantity = cart[index]?.quantity + action?.payload.quantity;

    const effectivePrice = this.getEffectiveSalePrice(cart[index]?.variation, cart[index]?.product);
    if(cart[index].product?.wholesales?.length) {
      let wholesale = cart[index].product.wholesales.find(value => value.min_qty <= cart[index].quantity && value.max_qty >= cart[index].quantity) || null;
      if(wholesale && cart[index].product.wholesale_price_type == 'fixed') {
        cart[index].sub_total = cart[index].quantity * wholesale.value;
        cart[index].wholesale_price = cart[index].sub_total / cart[index].quantity;
      } else if(wholesale && cart[index].product.wholesale_price_type == 'percentage') {
        cart[index].sub_total = cart[index].quantity * effectivePrice;
        cart[index].sub_total = cart[index].sub_total - (cart[index].sub_total * (wholesale.value / 100));
        cart[index].wholesale_price = cart[index].sub_total / cart[index].quantity;
      } else {
        cart[index].sub_total = cart[index].quantity * effectivePrice;
        cart[index].wholesale_price = null;
      }
    } else {
      cart[index].sub_total = cart[index].quantity * effectivePrice;
      cart[index].wholesale_price = null;
    }

    if(cart[index].quantity < 1) {
      this.store.dispatch(new DeleteCart(action.payload.id!));
      return of();
    }

    let total = state.items.reduce((prev, curr: Cart) => {
      return (prev + Number(curr.sub_total));
    }, 0);
  
    const newState = {
      ...state,
      total: total
    };

    ctx.patchState(newState);

    // Sincronizar con localStorage
    this.syncToLocalStorage(newState.items, newState.total, newState.is_digital_only);

    return true;
  }

  @Action(DeleteCart)
  delete(ctx: StateContext<CartStateModel>, { id }: DeleteCart) {
    const state = ctx.getState();
    let cart = state.items.filter(value => value.id !== id);
    let total = cart.reduce((prev, curr: Cart) => {
      return (prev + Number(curr.sub_total));
    }, 0);
    
    const newState = {
      items: cart,
      total: total,
      is_digital_only: state.is_digital_only,
      sidebarCartOpen: state.sidebarCartOpen
    };
    
    ctx.patchState(newState);
    
    // Sincronizar con localStorage
    this.syncToLocalStorage(newState.items, newState.total, newState.is_digital_only);
    
    return true;
  }

  @Action(ClearCart)
  clearCart(ctx: StateContext<CartStateModel>) {
    const newState = {
      items: [],
      total: 0,
      is_digital_only: null,
      sidebarCartOpen: false
    };
    
    ctx.patchState(newState);
    
    // Sincronizar con localStorage
    this.syncToLocalStorage(newState.items, newState.total, newState.is_digital_only);
  }

  @Action(ToggleSidebarCart)
  toggleSidebarCart(ctx: StateContext<CartStateModel>, { value }: ToggleSidebarCart) {
    ctx.patchState({
      sidebarCartOpen: value
    });
  }

  @Action(LoadCartFromLocalStorage)
  loadFromLocalStorage(ctx: StateContext<CartStateModel>) {
    this.loadFromLocalStorageInternal(ctx);
  }

  // Método interno para cargar desde localStorage
  private loadFromLocalStorageInternal(ctx: StateContext<CartStateModel>) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const parsedData = JSON.parse(cartData);
          
          ctx.patchState({
            items: parsedData.items || [],
            total: parsedData.total || 0,
            is_digital_only: parsedData.is_digital_only || null,
            sidebarCartOpen: false
          });
        }
      } catch (error) {
        // Limpiar datos corruptos
        localStorage.removeItem('cart');
      }
    }
  }

  // Método privado para sincronizar con localStorage
  private syncToLocalStorage(items: Cart[], total: number, isDigitalOnly: boolean | number | null) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const cartData = {
          items: items,
          total: total,
          is_digital_only: isDigitalOnly
        };
        
        localStorage.setItem('cart', JSON.stringify(cartData));
      } catch (error) {
      }
    }
  }
}