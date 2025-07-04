import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { OrderModel, Order } from '../interface/order.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) {}

  getOrders(payload?: Params): Observable<OrderModel> {
    return this.http.get<any>(`${environment.URL}/orders`, {
      params: payload,
    }).pipe(
      map((response: any) => {
        // Transformar la respuesta de la API al formato esperado por el frontend
        const transformedOrders = (response.data || []).map((order: any) => ({
          id: order.id || order._id,
          order_id: order.order_id || order._id,
          order_number: order.order_number,
          amount: order.total_amount,
          store_id: order.store_id,
          store: order.store || null,
          consumer_id: order.user_id,
          consumer: order.consumer || { name: order.shipping_address?.name || 'Cliente' },
          order_status_activities: order.order_status_activities || [],
          consumer_name: order.shipping_address?.name || 'Cliente',
          products: order.items?.map((item: any) => item.product_id) || [],
          coupon_id: order.coupon_id || null,
          coupon: order.coupon || null,
          coupon_total_discount: order.discount_amount || 0,
          billing_address_id: order.billing_address_id || null,
          billing_address: order.billing_address || null,
          shipping_address_id: order.shipping_address_id || null,
          shipping_address: order.shipping_address || null,
          shipping_total: order.shipping_cost || 0,
          delivery_interval: order.delivery_interval || '',
          order_status_id: order.order_status_id || null,
          order_status: order.order_status || { name: order.status, slug: order.status },
          parent_id: order.parent_id || null,
          payment_method: order.payment_method || '',
          payment_mode: order.payment_method || '',
          payment_status: order.payment_status || 'pending',
          delivery_description: order.notes || '',
          order_payment_status: order.payment_status || 'pending',
          sub_orders: order.sub_orders || [],
          tax_total: order.tax_amount || 0,
          total: order.total_amount,
          points_amount: order.points_amount || 0,
          wallet_balance: order.wallet_balance || 0,
          transactions: order.transactions || [],
          invoice_url: order.invoice_url || '',
          is_digital_only: order.is_digital_only || false,
          status: order.status !== 'cancelled',
          created_by_id: order.created_by_id || null,
          deleted_at: order.deleted_at,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        }));
        
        const transformedResponse: OrderModel = {
          data: transformedOrders,
          total: response.pagination?.total || 0,
          current_page: response.pagination?.page || 1,
          per_page: response.pagination?.limit || 10,
          last_page: response.pagination?.totalPages || 1
        };
        
        return transformedResponse;
      })
    );
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<any>(`${environment.URL}/orders/number/${orderNumber}`).pipe(
      map((response: any) => {
        const order = response.data;
        
        // Transformar los items a la estructura de productos esperada
        const transformedProducts = (order.items || []).map((item: any) => ({
          id: item.product_id._id,
          name: item.product_id.name,
          price: item.product_id.price,
          product_thumbnail: null, // No hay imagen en la respuesta actual
          pivot: {
            quantity: item.quantity,
            single_price: item.price,
            wholesale_price: item.sale_price,
            subtotal: item.total,
            variation: null // No hay variaciones en la respuesta actual
          }
        }));
        
        // Transformar la orden individual al formato esperado
        return {
          id: order.id || order._id,
          order_id: order.order_id || order._id,
          order_number: order.order_number,
          amount: order.subtotal || order.total_amount,
          store_id: order.store_id,
          store: order.store || null,
          consumer_id: order.user_id,
          consumer: order.consumer || { 
            name: order.shipping_address?.name || 'Cliente',
            email: order.shipping_address?.email || ''
          },
          order_status_activities: order.order_status_activities || [],
          consumer_name: order.shipping_address?.name || 'Cliente',
          products: transformedProducts,
          coupon_id: order.coupon_id || null,
          coupon: order.coupon || null,
          coupon_total_discount: order.discount_amount || 0,
          billing_address_id: order.billing_address_id || null,
          billing_address: {
            id: 0,
            user_id: order.user_id || 0,
            title: 'Billing Address',
            street: order.billing_address?.address || '',
            type: 'billing',
            city: order.billing_address?.city || '',
            pincode: order.billing_address?.postal_code || '',
            state_id: 0,
            state: { 
              id: 0,
              name: order.billing_address?.state || '',
              country_id: 0
            },
            country_code: 0,
            country: { name: order.billing_address?.country || '' },
            phone: order.billing_address?.phone || '',
            country_id: 0,
            is_default: false
          },
          shipping_address_id: order.shipping_address_id || null,
          shipping_address: {
            id: 0,
            user_id: order.user_id || 0,
            title: 'Shipping Address',
            street: order.shipping_address?.address || '',
            type: 'shipping',
            city: order.shipping_address?.city || '',
            pincode: order.shipping_address?.postal_code || '',
            state_id: 0,
            state: { 
              id: 0,
              name: order.shipping_address?.state || '',
              country_id: 0
            },
            country_code: 0,
            country: { name: order.shipping_address?.country || '' },
            phone: order.shipping_address?.phone || '',
            country_id: 0,
            is_default: false
          },
          shipping_total: order.shipping_cost || 0,
          delivery_interval: order.delivery_interval || '',
          order_status_id: order.order_status_id || null,
          order_status: order.order_status || { 
            name: order.status, 
            slug: order.status,
            sequence: 1
          },
          parent_id: order.parent_id || null,
          payment_method: order.payment_method || '',
          payment_mode: order.payment_method || '',
          payment_status: order.payment_status || 'pending',
          delivery_description: order.notes || '',
          order_payment_status: order.payment_status || 'pending',
          sub_orders: order.sub_orders || [],
          tax_total: order.tax_amount || 0,
          total: order.total_amount,
          points_amount: order.points_amount || 0,
          wallet_balance: order.wallet_balance || 0,
          transactions: order.transactions || [],
          invoice_url: order.invoice_url || '',
          is_digital_only: order.is_digital_only || false,
          status: order.status !== 'cancelled',
          created_by_id: order.created_by_id || null,
          deleted_at: order.deleted_at,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        };
      })
    );
  }

  updateOrderStatus(orderId: number, payload: { order_status_id: number, note: string, changed_at: string }): Observable<any> {
    return this.http.put<any>(`${environment.URL}/orders/${orderId}/status`, payload);
  }

}
