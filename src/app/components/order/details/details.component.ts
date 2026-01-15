import { Component, Inject, inject, PLATFORM_ID, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { OrderStatusState } from '../../../shared/store/state/order-status.state';
import { Observable, Subject, combineLatest, mergeMap, of, switchMap, takeUntil, map } from 'rxjs';
import { OrderStatus, OrderStatusModel } from '../../../shared/interface/order-status.interface';
import { Select2Data, Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { PosInvoiceModalComponent } from '../checkout/modal/pos-invoice-modal/pos-invoice-modal.component';
import { ShippingNoteModalComponent } from './shipping-note-modal/shipping-note-modal.component';
import { Order, OrderStatusActivities } from '../../../shared/interface/order.interface';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GetOrderStatus } from '../../../shared/store/action/order-status.action';
import { DownloadInvoice, ViewOrder } from '../../../shared/store/action/order.action';
import { OrderState } from '../../../shared/store/state/order.state';
import { TranslateModule } from '@ngx-translate/core';
import { CurrencySymbolPipe } from '../../../shared/pipe/currency-symbol.pipe';
import { PageWrapperComponent } from '../../../shared/components/page-wrapper/page-wrapper.component';

@Component({
    selector: 'app-details',
    imports: [CommonModule, TranslateModule, Select2Module,
        CurrencySymbolPipe, RouterModule, PageWrapperComponent,
        PosInvoiceModalComponent, ShippingNoteModalComponent, DatePipe
    ],
    providers: [DatePipe],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss'
})
export class DetailsComponent {

  orderStatus$: Observable<OrderStatusModel> = inject(Store).select(OrderStatusState.orderStatus);
  orderStatuses$: Observable<Select2Data> = inject(Store).select(OrderStatusState.orderStatuses) as Observable<Select2Data>;
  
  // Observable de la orden seleccionada desde el store
  selectedOrder$: Observable<Order> = inject(Store).select(OrderState.selectedOrder) as Observable<Order>;
  
  // Observable combinado que actualiza los estados con las fechas de actividades y la orden
  orderStatusWithActivities$: Observable<OrderStatusModel>;

  @ViewChild("posInvoice") PosInvoice: PosInvoiceModalComponent;
  @ViewChild("shippingNote") ShippingNote: ShippingNoteModalComponent;

  public order: Order;
  public statuses: OrderStatus[] = [];
  public init: boolean;
  private destroy$ = new Subject<void>();
  public isBrowser: boolean;

  constructor(private store: Store,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId)
    this.store.dispatch(new GetOrderStatus());
    this.init = true;
    
    // Crear el observable combinado que actualiza los estados con las fechas de actividades
    // Este observable se actualiza cuando cambian los estados o la orden seleccionada
    this.orderStatusWithActivities$ = combineLatest([
      this.store.select(OrderStatusState.orderStatus),
      this.store.select(OrderState.selectedOrder)
    ]).pipe(
      map(([orderStatusModel, order]) => {
        if (!orderStatusModel || !orderStatusModel.data) {
          return orderStatusModel;
        }
        
        // Si no hay orden o actividades, retornar los estados sin fechas
        if (!order || !order.order_status_activities) {
          return orderStatusModel;
        }
        
        // Mapear las fechas de actividades a los estados
        const updatedData = orderStatusModel.data.map(status => {
          const activity = order.order_status_activities?.find(act => 
            act.status === status.name || 
            act.status === status.slug ||
            (status.name && act.status?.toLowerCase() === status.name.toLowerCase())
          );
          
          if (activity?.changed_at) {
            return {
              ...status,
              activities_date: this.datePipe.transform(activity.changed_at, 'dd MMM yyyy') || ''
            };
          }
          return status;
        });
        
        return {
          ...orderStatusModel,
          data: updatedData
        };
      })
    );
  }

  ngOnInit() {
    this.route.params
      .pipe(
        switchMap(params => {
            if(!params['id']) return of();
            return this.store
                      .dispatch(new ViewOrder(params['id']))
                      .pipe(mergeMap(() => this.store.select(OrderState.selectedOrder)))
          }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(order => {
        console.log('🟡 [DetailsComponent] Subscribe ejecutado, order recibido:', order ? 'SI' : 'NO', order?.id, order?.order_number);
        console.log('🟡 [DetailsComponent] this.order actual:', this.order ? 'SI' : 'NO', this.order?.id, this.order?.order_number);
        
        // PROTECCIÓN: Si ya tenemos una orden válida, NO sobrescribir con null/undefined
        if (!order || !order.id) {
          if (this.order && this.order.id) {
            console.log('⚠️ [DetailsComponent] Se recibió null/undefined pero ya tenemos orden válida. MANTENIENDO orden existente');
            return; // NO hacer nada, mantener la orden actual
          }
          console.log('⚠️ [DetailsComponent] Orden inválida recibida y no hay orden previa');
          return;
        }
        
        // PROTECCIÓN: Si es la misma orden que ya tenemos, verificar si el estado cambió
        if (this.order && this.order.id && 
            (this.order.id === order.id || 
             (this.order.order_number && order.order_number && String(this.order.order_number) === String(order.order_number)))) {
          // Verificar si el estado de la orden cambió comparando ID, slug, name y sequence
          const currentStatusId = this.order.order_status_id || this.order.order_status?.id;
          const newStatusId = order.order_status_id || order.order_status?.id;
          const currentSequence = this.order.order_status?.sequence;
          const newSequence = order.order_status?.sequence;
          const currentSlug = this.order.order_status?.slug;
          const newSlug = order.order_status?.slug;
          const currentName = this.order.order_status?.name;
          const newName = order.order_status?.name;
          
          // Actualizar si cambió el ID, slug, name o la secuencia del estado
          const statusChanged = currentStatusId !== newStatusId || 
                               currentSequence !== newSequence ||
                               currentSlug !== newSlug ||
                               currentName !== newName;
          
          if (!statusChanged) {
            console.log('⚠️ [DetailsComponent] Misma orden recibida, estado no cambió pero actualizando para refrescar panel');
            console.log('🟡 [DetailsComponent] Estado actual:', {id: currentStatusId, slug: currentSlug, name: currentName, sequence: currentSequence});
            console.log('🟡 [DetailsComponent] Estado nuevo:', {id: newStatusId, slug: newSlug, name: newName, sequence: newSequence});
          } else {
            console.log('🟢 [DetailsComponent] Misma orden pero estado cambió, ACTUALIZANDO');
            console.log('🟡 [DetailsComponent] Estado anterior:', {id: currentStatusId, slug: currentSlug, name: currentName, sequence: currentSequence});
            console.log('🟡 [DetailsComponent] Estado nuevo:', {id: newStatusId, slug: newSlug, name: newName, sequence: newSequence});
          }
          
          // SIEMPRE actualizar la orden completa para refrescar el panel, incluso si el estado no cambió
          // Esto asegura que el panel de tracking se actualice correctamente
          this.order = {
            ...this.order,
            ...order,
            order_status: order.order_status ? { ...order.order_status } : order.order_status,
            order_status_activities: order.order_status_activities ? [...order.order_status_activities] : order.order_status_activities
          };
          
          // Forzar detección de cambios para actualizar el panel de tracking
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
          
          return; // Ya actualizamos, no continuar con la actualización completa
        }
        
        console.log('🟢 [DetailsComponent] Actualizando orden con nuevos datos');
        // Crear una nueva referencia completa para forzar la detección de cambios
        this.order = {
          ...order,
          order_status: order.order_status ? { ...order.order_status } : order.order_status,
          order_status_activities: order.order_status_activities ? [...order.order_status_activities] : order.order_status_activities
        };
        
        // DEBUG: Verificar valores del resumen
        console.log('🟡 [DetailsComponent] Orden recibida:', this.order);
        console.log('🟡 [DetailsComponent] order_status:', this.order?.order_status);
        console.log('🟡 [DetailsComponent] order_status.sequence:', this.order?.order_status?.sequence);
        console.log('🟡 [DetailsComponent] order_status.id:', this.order?.order_status?.id);
        console.log('🟡 [DetailsComponent] order_status.slug:', this.order?.order_status?.slug);
        console.log('🟡 [DetailsComponent] order_status.name:', this.order?.order_status?.name);
        console.log('🟡 [DetailsComponent] amount:', this.order?.amount, typeof this.order?.amount);
        console.log('🟡 [DetailsComponent] shipping_total:', this.order?.shipping_total, typeof this.order?.shipping_total);
        console.log('🟡 [DetailsComponent] tax_total:', this.order?.tax_total, typeof this.order?.tax_total);
        console.log('🟡 [DetailsComponent] total:', this.order?.total, typeof this.order?.total);
        
        // DEBUG: Verificar datos del consumidor
        console.log('🟡 [DetailsComponent] customer_name:', this.order?.customer_name);
        console.log('🟡 [DetailsComponent] consumer?.name:', this.order?.consumer?.name);
        console.log('🟡 [DetailsComponent] consumer?.email:', this.order?.consumer?.email);
        console.log('🟡 [DetailsComponent] consumer completo:', this.order?.consumer);
        
        // Forzar detección de cambios para actualizar el panel de tracking
        // Usar setTimeout para asegurar que Angular detecte el cambio después de la actualización
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
    });


  }

  updateOrderStatus(data: Select2UpdateEvent) {
    if(data && data?.value) {
      if(!this.init)
        this.ShippingNote.openModal(this.order?.id, Number(data.value));

      this.init = false
    }
  }

  getDate(status: string, order: OrderStatusActivities[]){
    const getdate = order?.map(res => {
      const convertDate = this.datePipe.transform(res?.changed_at, 'dd MMM yyyy hh:mm:a')!
      return status === res.status ? convertDate  : ' '
    })
    return getdate;
  }

  ngOnDestroy() {
    this.statuses = [];
    this.destroy$.next();
    this.destroy$.complete();
  }

  download(id: number){
    this.store.dispatch(new DownloadInvoice({order_number: id}))
  }
}
