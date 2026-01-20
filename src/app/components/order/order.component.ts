import { Component, inject, Inject, Renderer2 } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OrderState } from '../../shared/store/state/order.state';
import { DashboardState } from '../../shared/store/state/dashboard.state';
import { Observable } from 'rxjs';
import { Order, OrderModel } from '../../shared/interface/order.interface';
import { StatisticsCount } from '../../shared/interface/dashboard.interface';
import { TableClickedAction, TableConfig } from '../../shared/interface/table.interface';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { GetOrders } from '../../shared/store/action/order.action';
import { GetOrderStatus } from '../../shared/store/action/order-status.action';
import { GetStatisticsCount } from '../../shared/store/action/dashboard.action';
import { TranslateModule } from '@ngx-translate/core';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { TableComponent } from '../../shared/components/ui/table/table.component';

@Component({
    selector: 'app-order',
    imports: [CommonModule, TranslateModule, RouterModule,
        HasPermissionDirective, PageWrapperComponent, TableComponent
    ],
    templateUrl: './order.component.html',
    styleUrl: './order.component.scss'
})
export class OrderComponent {

  order$: Observable<OrderModel> = inject(Store).select(OrderState.order);
  statistics$: Observable<StatisticsCount> = inject(Store).select(DashboardState.statistics) as Observable<StatisticsCount>;

  public tableConfig: TableConfig = {
    columns: [
      { title: "order_number", dataField: "order_id" },
      { title: "order_date", dataField: "created_at", type: "date", sortable: true, sort_direction: 'desc' },
      { title: "customer_name", dataField: "consumer_name" },
      { title: "status", dataField: "order_status_display" },
      { title: "total_amount", dataField: "total", type: 'price' },
      { title: "payment_status", dataField: "order_payment_status" },
      { title: "payment_method", dataField: "payment_mode" }
    ],
    rowActions: [
      { label: "View", actionToPerform: "view", icon: "ri-eye-line", permission: "order.edit" }
    ],
    data: [],
    total: 0
  };
  public selectedStatus: string;
  public filterPills: any[] = [
    {
      value: 'pending',
      label: 'Pending',
      countKey: 'total_pending_orders',
      color: 'pending',
    },
    {
      value: 'processing',
      label: 'Processing',
      countKey: 'total_processing_orders',
      color: 'processing',

    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      countKey: 'total_cancelled_orders',
      color: 'cancel',
    },
    {
      value: 'shipped',
      label: 'Shipped',
      countKey: 'total_shipped_orders',
      color: 'shipped',
    },
    {
      value: 'out-for-delivery',
      label: 'Out for delivery',
      countKey: 'total_out_of_delivery_orders',
      color: 'out-delivery',
    },
    {
      value: 'delivered',
      label: 'Delivered',
      countKey: 'total_delivered_orders',
      color: 'completed',
    },
  ]

  public filter: Params = {}

  constructor(private store: Store, private activatedRoute: ActivatedRoute,
    private router: Router, private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit() {
    // Cargar estados de órdenes
    this.store.dispatch(new GetOrderStatus());
    // Cargar estadísticas para los conteos de estados
    this.store.dispatch(new GetStatisticsCount());
    
    // Mapeo de IDs a slugs correctos (para cuando el backend envía datos incorrectos)
    const statusIdToSlugMap: { [key: number]: { slug: string, name: string } } = {
      1: { slug: 'pending', name: 'pending' },
      2: { slug: 'processing', name: 'processing' },
      3: { slug: 'cancelled', name: 'cancelled' },
      4: { slug: 'shipped', name: 'shipped' },
      5: { slug: 'out-for-delivery', name: 'out_for_delivery' },
      6: { slug: 'delivered', name: 'delivered' }
    };
    
    this.order$.subscribe(order => {
      if (order?.data && order.data.length > 0) {
        // DEBUG: Ver qué campos tiene el primer pedido
        console.log('🟡 [OrderComponent] Primer pedido antes de procesar:', order.data[0]);
        console.log('🟡 [OrderComponent] payment_status:', order.data[0]?.payment_status);
        console.log('🟡 [OrderComponent] payment_method:', order.data[0]?.payment_method);
        console.log('🟡 [OrderComponent] order_status:', order.data[0]?.order_status);
        
        let orders = order.data.map((element: Order) => {
          element.order_id = `<span class="fw-bolder">#${element?.order_number}</span>`;
          
          // Estado de la orden - mostrar todos los estados que vengan del backend
          const orderStatus = element?.order_status;
          // También verificar si hay un campo 'status' directo (puede venir como string)
          const statusString = (element as any)?.status;
          let statusSlug: string | undefined;
          let statusName: string | undefined;
          
          // DEBUG: Ver qué está llegando del backend para esta orden específica
          console.log('🟡 [OrderComponent] Procesando orden:', element?.order_number, 'orderStatus:', orderStatus);
          
          // Prioridad 1: Usar el slug del backend si existe y es válido
          if (orderStatus?.slug && orderStatus.slug.trim() !== '') {
            statusSlug = orderStatus.slug;
            console.log('🟢 [OrderComponent] Usando slug del backend:', statusSlug, 'para orden:', element?.order_number);
          }
          
          // Prioridad 2: Si no hay order_status pero hay status como string, usarlo
          if (!statusSlug && statusString && typeof statusString === 'string') {
            statusSlug = statusString;
            console.log('🟢 [OrderComponent] Usando status string:', statusSlug, 'para orden:', element?.order_number);
          }
          
          // Prioridad 3: Si tenemos ID pero no slug, usar el mapeo
          if (!statusSlug && orderStatus?.id && statusIdToSlugMap[orderStatus.id]) {
            const mappedStatus = statusIdToSlugMap[orderStatus.id];
            statusSlug = mappedStatus.slug;
            statusName = mappedStatus.name;
            console.log('🟢 [OrderComponent] Usando mapeo por ID:', orderStatus.id, '-> slug:', statusSlug, 'para orden:', element?.order_number);
          }
          
          if (statusSlug) {
            // Determinar el nombre a usar
            let nameToFormat: string;
            if (orderStatus?.name && 
                orderStatus.name.trim() !== '' && 
                orderStatus.name.toLowerCase() !== 'desconocido' &&
                orderStatus.name.toLowerCase() !== 'unknown') {
              nameToFormat = orderStatus.name;
            } else if (statusName) {
              // Usar el nombre del mapeo si está disponible
              nameToFormat = statusName;
            } else {
              // Generar nombre desde slug: convertir guiones a espacios
              nameToFormat = statusSlug.replace(/-/g, ' ');
            }
            
            // Formatear el nombre: reemplazar guiones bajos por espacios y capitalizar cada palabra
            const formattedName = nameToFormat
              .replace(/_/g, " ")
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ");
              
            console.log('🟢 [OrderComponent] Estado final para orden', element?.order_number, ':', {slug: statusSlug, name: formattedName});
            (element as any).order_status_display = `<div class="status-${statusSlug}"><span>${formattedName}</span></div>`;
          } else {
            console.log('⚠️ [OrderComponent] No se pudo determinar el estado para orden:', element?.order_number, 'orderStatus:', orderStatus, 'statusString:', statusString);
            (element as any).order_status_display = '<div class="status-pending"><span>-</span></div>';
          }
          
          // Estado de pago - buscar en diferentes ubicaciones posibles
          // El backend puede tener payment_status directamente o en otro lugar
          const paymentStatus = (element as any)?.payment_status 
            || (element as any)?.payment?.status 
            || (element as any)?.transaction?.payment_status
            || '';
          element.order_payment_status = paymentStatus 
            ? `<div class="status-${paymentStatus.toLowerCase()}"><span>${paymentStatus.replace(/_/g, " ")}</span></div>` 
            : '<div class="status-pending"><span>Pendiente</span></div>'; // Valor por defecto si no existe
          
          // Método de pago - buscar en diferentes ubicaciones posibles
          const paymentMethod = (element as any)?.payment_method 
            || (element as any)?.payment?.method 
            || (element as any)?.transaction?.payment_method
            || '';
          element.payment_mode = paymentMethod 
            ? `<div class="payment-mode"><span>${paymentMethod.replace(/_/g, " ").toUpperCase()}</span></div>` 
            : '<div class="payment-mode"><span>N/A</span></div>'; // Valor por defecto si no existe
          
          // Nombre del consumidor
          element.consumer_name = `<span class="text-capitalize">${element?.consumer?.name || ''}</span>`;
          
          return element;
        });
        
        // DEBUG: Ver el primer pedido después de procesar
        if (orders.length > 0) {
          console.log('🟢 [OrderComponent] Primer pedido después de procesar:', orders[0]);
          console.log('🟢 [OrderComponent] order_payment_status:', orders[0].order_payment_status);
          console.log('🟢 [OrderComponent] payment_mode:', orders[0].payment_mode);
        }
        
        this.tableConfig.data = orders;
        this.tableConfig.total = order?.total || orders.length;
      } else {
        this.tableConfig.data = [];
        this.tableConfig.total = 0;
      }
    });

    this.statistics$.subscribe((statistics:any) => {
      this.filterPills.forEach((status, index) => {
        const countKey = status.countKey;
        if (statistics && statistics.hasOwnProperty(countKey)) {
          status['count'] = statistics[countKey];
        }
      });
    });

    this.activatedRoute.queryParams.subscribe(params => {
      const statusParam = params['status'] ? params['status'] : '';
      this.selectedStatus = statusParam;
      // Limpiar el filtro y reconstruirlo con el status correcto
      this.filter = {
        status: statusParam,
        start_date: params['start_date'] || '',
        end_date: params['end_date'] || '',
        page: params['page'] || 1,
        paginate: params['paginate'] || 15
      };
      console.log('🟡 [OrderComponent] Filtro aplicado desde queryParams:', this.filter);
      this.store.dispatch(new GetOrders(this.filter));
      this.store.dispatch(new GetStatisticsCount(this.filter));
    })
  }

  onTableChange(data?: Params) {
    const startDate = data && data['start_date'] ? data['start_date'] : '';
    const endDate = data && data['end_date'] ? data['end_date'] : '';
    const status = this.selectedStatus ? this.selectedStatus : '';

    // Actualizar el filtro manteniendo el status seleccionado
    this.filter = { 
      ...this.filter, 
      ...data, 
      start_date: startDate, 
      end_date: endDate,
      status: status
    };

    console.log('🟡 [OrderComponent] onTableChange - Filtro actualizado:', this.filter);

    this.store.dispatch(new GetOrders(this.filter));
    this.store.dispatch(new GetStatisticsCount({ start_date: startDate, end_date: endDate, status: status }));
  }

  onActionClicked(action: TableClickedAction) {
    if(action.actionToPerform == 'view')
      this.view(action.data)
  }

  view(data: Order) {
    this.router.navigateByUrl(`/order/details/${data.order_number}`);
  }

  filterOrder(status: string) {
    this.renderer.addClass(this.document.body, 'loader-none');
    console.log('🟡 [OrderComponent] filterOrder - Cambiando estado a:', status);
    this.router.navigate([], {
      queryParams: {
        'status': status ? status : null,
        'page': 1 // Resetear a la primera página cuando se cambia el filtro
      },
      queryParamsHandling: 'merge'
    });
  }

}
