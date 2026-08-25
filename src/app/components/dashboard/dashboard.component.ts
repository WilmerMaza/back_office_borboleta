import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, Inject, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Params, Router, RouterModule } from '@angular/router';
import { NgbModule, NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';

import type {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexResponsive,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { Select2Data, Select2Module, Select2Option, Select2UpdateEvent } from 'ng-select2-component';
import { Observable } from 'rxjs';
import { AccountUser } from '../../shared/interface/account.interface';
import { RevenueChart, StatisticsCount } from '../../shared/interface/dashboard.interface';
import { Notice } from '../../shared/interface/notice.interface';
import { Order, OrderModel } from '../../shared/interface/order.interface';
import { Product, ProductModel } from '../../shared/interface/product.interface';
import { TableClickedAction, TableConfig } from '../../shared/interface/table.interface';
import { CurrencySymbolPipe } from '../../shared/pipe/currency-symbol.pipe';
import { GetBlogs } from '../../shared/store/action/blog.action';
import { GetCategories } from '../../shared/store/action/category.action';
import { GetRevenueChart, GetStatisticsCount } from '../../shared/store/action/dashboard.action';
import { MarkAsReadNotice, ResentNotice } from '../../shared/store/action/notice.action';
import { GetOrders } from '../../shared/store/action/order.action';
import { GetProducts } from '../../shared/store/action/product.action';
import { AccountState } from '../../shared/store/state/account.state';
import { CategoryState } from '../../shared/store/state/category.state';
import { DashboardState } from '../../shared/store/state/dashboard.state';
import { NoticeState } from '../../shared/store/state/notice.state';
import { OrderState } from '../../shared/store/state/order.state';
import { ProductState } from '../../shared/store/state/product.state';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { TableComponent } from '../../shared/components/ui/table/table.component';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
  markers: ApexMarkers;
  legend: ApexLegend;
  responsive: ApexResponsive[];
};

type SalesKpiCard = { labelKey: string; value: string };

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    Select2Module,
    CurrencySymbolPipe,
    PageWrapperComponent,
    TableComponent,
    NgbModule,
    HasPermissionDirective,
  ],
  providers: [CurrencySymbolPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private apexChart: { render: () => void | Promise<void>; updateOptions: (...args: unknown[]) => unknown; destroy: () => void } | null =
    null;

  private latestRevenueChart: RevenueChart | null = null;
  private latestStatistics: StatisticsCount | null = null;

  statistics$: Observable<StatisticsCount | null> = inject(Store).select(DashboardState.statistics);
  revenueChart$: Observable<RevenueChart | null> = inject(Store).select(DashboardState.revenueChart);
  order$: Observable<OrderModel | null> = inject(Store).select(OrderState.order);
  product$: Observable<ProductModel> = inject(Store).select(ProductState.product);
  topProduct$: Observable<Product[]> = inject(Store).select(ProductState.topSellingProducts);
  category$: Observable<Select2Data> = inject(Store).select(CategoryState.categories);
  user$: Observable<AccountUser> = inject(Store).select(AccountState.user);
  notice$: Observable<Notice> = inject(Store).select(NoticeState.recentNotice) as Observable<Notice>;

  @ViewChild('chart') chart!: ElementRef;

  public today = new Date();
  public chartOptions!: Partial<ChartOptions>;
  public charts: any;
  public isBrowser: boolean;

  public topProductLoader = false;
  public productStockLoader = false;
  public notice!: Notice;
  public filterType = '';

  /** Período activo del dashboard: mismo valor en todos los filtros y en las peticiones al API. */
  public dashboardFilterBy = 'all_time';

  public salesKpiCards: SalesKpiCard[] = [];

  public filter: Select2Data = [];

  public orderTableConfig: TableConfig = {
    columns: [
      { title: 'number', dataField: 'order_id' },
      { title: 'date', dataField: 'created_at', type: 'date', date_format: 'dd MMM yyyy' },
      { title: 'name', dataField: 'consumer_name' },
      { title: 'amount', dataField: 'total', type: 'price' },
      { title: 'payment', dataField: 'order_payment_status' },
    ],
    rowActions: [{ label: 'View', actionToPerform: 'view', icon: 'ri-eye-line', permission: 'order.edit' }],
    data: [],
    total: 0,
  };

  public productStockTableConfig: TableConfig = {
    columns: [
      {
        title: 'image',
        dataField: 'product_thumbnail',
        class: 'tbl-image',
        type: 'image',
        placeholder: 'assets/images/product.png',
      },
      { title: 'name', dataField: 'name' },
      { title: 'quantity', dataField: 'quantity' },
      { title: 'stock', dataField: 'stock' },
    ],
    rowActions: [{ label: 'Edit', actionToPerform: 'edit', icon: 'ri-pencil-line', permission: 'product.edit' }],
    data: [] as Product[],
    total: 0,
  };

  constructor(
    private renderer: Renderer2,
    config: NgbRatingConfig,
    @Inject(DOCUMENT) private document: Document,
    private store: Store,
    private router: Router,
    private currencySymbolPipe: CurrencySymbolPipe,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.refreshPeriodFilterLabels();
    this.translate.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.refreshPeriodFilterLabels();
    });

    if (this.store.selectSnapshot((state) => state.account && state.account.roleName) !== 'admin') {
      this.store.dispatch(new ResentNotice('recent'));
    }
    this.notice$.subscribe((data) => (this.notice = data));
    config.max = 5;
    config.readonly = true;

    this.charts = {
      series: [{ name: 'Net Profit', data: [44, 55, 57, 56, 61] }],
      colors: ['#ec8951'],
      chart: { type: 'bar', height: 410 },
      plotOptions: { bar: { horizontal: false, columnWidth: '40%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun'] },
      yaxis: { title: { text: '$ (thousands)' } },
      fill: { opacity: 1 },
    };

    this.chartOptions = {
      series: [
        { name: this.translate.instant('dashboard_chart_revenue'), data: [], color: '#0da487' },
        { name: this.translate.instant('dashboard_chart_commission'), data: [], color: '#FFA53B' },
      ],
      chart: {
        height: 350,
        type: 'line',
        dropShadow: { enabled: true, top: 10, left: 0, blur: 3, color: '#720f1e', opacity: 0.1 },
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      markers: { strokeWidth: 4, strokeColors: '#ffffff', hover: { size: 9 } },
      stroke: { curve: 'smooth', lineCap: 'butt', width: 4 },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (value: number) => this.currencySymbolPipe.transform(value ?? 0) },
      },
      yaxis: {
        labels: { formatter: (value: number) => String(Math.round(value ?? 0)) },
      },
      grid: {
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      legend: { show: false },
      responsive: [
        { breakpoint: 1200, options: { grid: { padding: { right: -95 } } } },
        { breakpoint: 992, options: { grid: { padding: { right: -69 } } } },
        { breakpoint: 767, options: { chart: { height: 260 } } },
        { breakpoint: 576, options: { yaxis: { labels: { show: false } } } },
      ],
      xaxis: {
        categories: [],
        range: undefined,
        axisBorder: { offsetX: 0, show: false },
        axisTicks: { show: false },
      },
    };

    this.statistics$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((statistics) => {
      this.latestStatistics = statistics;
      this.updateSalesKpis();
    });

    this.revenueChart$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((revenue) => {
      this.latestRevenueChart = revenue;
      this.applyRevenueChartData(revenue);
      this.updateSalesKpis();
    });

    this.order$.subscribe((order) => {
      const orders = order?.data?.map((element: Order) => {
        element.order_id = `<span class="fw-bolder">#${element.order_number}</span>`;
        if (element.payment_status) {
          const slug = element.payment_status.toLowerCase();
          const payLabel = this.translate.instant(slug);
          const payText = payLabel !== slug ? payLabel : element.payment_status.replace(/_/g, ' ');
          element.order_payment_status = `<div class="status-${slug}"><span>${payText}</span></div>`;
        } else {
          element.order_payment_status = '-';
        }
        element.consumer_name = `<span class="text-capitalize">${element?.consumer?.name}</span>`;
        return element;
      });
      this.orderTableConfig.data = order && orders ? orders.slice(0, 5) : [];
      this.orderTableConfig.total = order ? order?.total : 0;
    });

    this.product$.subscribe((product) => {
      const products = product?.data?.map((element: Product) => {
        if (element.stock_status) {
          const slug = element.stock_status;
          const stockLabel = this.translate.instant(slug);
          const stockText = stockLabel !== slug ? stockLabel : slug.replace(/_/g, ' ');
          element.stock = `<div class="status-${slug}"><span>${stockText}</span></div>`;
        } else {
          element.stock = '-';
        }
        return element;
      });
      this.productStockTableConfig.data = product && products ? products : [];
      this.productStockTableConfig.total = product ? product?.total : 0;
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      void this.bootstrapChartsDom();
    });
  }

  private async bootstrapChartsDom(): Promise<void> {
    if (!this.chart?.nativeElement) {
      return;
    }
    try {
      if (!this.chartOptions?.series?.length) {
        return;
      }
      for (const s of this.chartOptions.series) {
        if (!s.data) {
          s.data = [];
        }
      }
      const ApexCharts = (await import('apexcharts')).default;
      const instance = new ApexCharts(this.chart.nativeElement, this.chartOptions);
      await instance.render();
      this.apexChart = instance;
    } catch (error) {
      console.error('Error al renderizar el gráfico:', error);
    }
  }

  private findPeriodOption(value: string): Select2Option | undefined {
    return this.filter.find((entry): entry is Select2Option => 'value' in entry && String(entry.value) === value);
  }

  private refreshPeriodFilterLabels(): void {
    const current = this.dashboardFilterBy || 'all_time';
    this.filter = [
      { value: 'today', label: this.translate.instant('dashboard_period_today') },
      { value: 'last_week', label: this.translate.instant('dashboard_period_last_week') },
      { value: 'last_month', label: this.translate.instant('dashboard_period_last_month') },
      { value: 'this_year', label: this.translate.instant('dashboard_period_this_year') },
      { value: 'all_time', label: this.translate.instant('dashboard_period_all_time') },
    ];
    this.dashboardFilterBy = current;
    const item = this.findPeriodOption(current);
    if (item) {
      this.filterType = item.label;
    }
  }

  private updateSalesKpis(): void {
    const revenues = this.latestRevenueChart?.revenues ?? [];
    const commissions = this.latestRevenueChart?.commissions ?? [];
    const totalRevenue = revenues.reduce((acc, value) => acc + this.toNumber(value), 0);
    const totalCommission = commissions.reduce((acc, value) => acc + this.toNumber(value), 0);
    const activeMonths = revenues.filter((value) => this.toNumber(value) > 0).length;
    const averageRevenue = activeMonths > 0 ? totalRevenue / activeMonths : 0;
    const totalOrders = this.latestStatistics?.total_orders ?? 0;

    this.salesKpiCards = [
      { labelKey: 'dashboard_kpi_accumulated_revenue', value: this.currencySymbolPipe.transform(totalRevenue) },
      { labelKey: 'dashboard_kpi_accumulated_commissions', value: this.currencySymbolPipe.transform(totalCommission) },
      { labelKey: 'dashboard_kpi_monthly_average', value: this.currencySymbolPipe.transform(averageRevenue) },
      {
        labelKey: 'dashboard_kpi_months_with_data',
        value: String(activeMonths || (this.latestRevenueChart?.months?.length ?? 0)),
      },
      { labelKey: 'dashboard_kpi_total_orders', value: String(totalOrders) },
      {
        labelKey: 'dashboard_kpi_avg_revenue_per_order',
        value: this.currencySymbolPipe.transform(totalOrders > 0 ? totalRevenue / totalOrders : 0),
      },
    ];
  }

  private applyRevenueChartData(revenue: RevenueChart | null): void {
    const base = this.chartOptions;
    if (revenue && Array.isArray(revenue.revenues) && Array.isArray(revenue.commissions)) {
      const maxLength = Math.max(revenue.revenues.length, revenue.commissions.length, revenue.months?.length || 0);
      const months = Array.from({ length: maxLength }, (_, i) => revenue.months?.[i] ?? `Mes ${i + 1}`);
      const revenues = Array.from({ length: maxLength }, (_, i) => Number(revenue.revenues?.[i] ?? 0));
      const commissions = Array.from({ length: maxLength }, (_, i) => Number(revenue.commissions?.[i] ?? 0));

      // Mostrar exactamente lo que devuelve el API para el filtro (incl. meses en 0), sin recortar puntos.

      this.chartOptions = {
        ...base,
        series: [
          { name: this.translate.instant('dashboard_chart_revenue'), data: revenues, color: '#ec8951' },
          { name: this.translate.instant('dashboard_chart_commission'), data: commissions, color: '#86909C' },
        ],
        xaxis: {
          ...(base?.xaxis || {}),
          categories: months,
        },
      };
    } else {
      this.chartOptions = {
        ...base,
        series: [
          { name: this.translate.instant('dashboard_chart_revenue'), data: [], color: '#ec8951' },
          { name: this.translate.instant('dashboard_chart_commission'), data: [], color: '#86909C' },
        ],
        xaxis: { ...(base?.xaxis || {}), categories: [] },
      };
    }
    this.syncApexChart();
  }

  private syncApexChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.apexChart || !this.chartOptions) {
      return;
    }
    void this.apexChart.updateOptions(
      {
        series: this.chartOptions.series,
        xaxis: this.chartOptions.xaxis,
      },
      true,
      true,
    );
  }

  private toNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private getSalesCount(product: Product): number {
    const p = product as Product & Record<string, unknown>;
    const candidates: unknown[] = [
      p.orders_count,
      p['ordersCount'],
      p['order_count'],
      p['orderCount'],
      p['total_orders'],
      p['totalOrders'],
      p['sold_count'],
      p['soldCount'],
      p['total_sold'],
      p['totalSold'],
      p['quantity_sold'],
      p['quantitySold'],
    ];
    for (const value of candidates) {
      const n = this.toNumber(value);
      if (n > 0) {
        return n;
      }
    }
    return 0;
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }
    const period = this.dashboardFilterBy || 'all_time';
    this.store.dispatch(new GetStatisticsCount({ filter_by: period }));
    this.store.dispatch(new GetRevenueChart({ filter_by: period }));
    this.store.dispatch(new GetProducts({ status: 1, top_selling: 1, filter_by: period, paginate: 5 }));
    this.store.dispatch(new GetBlogs({ status: 1, paginate: 2 }));
    this.store.dispatch(new GetCategories({ type: 'product', status: 1 }));
  }

  markAsRead(id: any): void {
    this.store.dispatch(new MarkAsReadNotice(id));
  }

  onOrderTableChange(data?: Params): void {
    if (data) {
      data['paginate'] = 7;
    }
    this.store.dispatch(new GetOrders(data!));
  }

  onOrderActionClicked(action: TableClickedAction): void {
    if (action.actionToPerform == 'view') {
      this.orderView(action.data);
    }
  }

  orderView(data: Order): void {
    this.router.navigateByUrl(`/order/details/${data.order_number}`);
  }

  onProductTableChange(data?: Params): void {
    if (data) {
      data['paginate'] = 8;
      data['field'] = 'quantity';
      data['sort'] = 'asc';
    }
    this.store.dispatch(new GetProducts(data)).subscribe({
      complete: () => {
        this.productStockLoader = false;
      },
    });
  }

  filterProduct(data: Select2UpdateEvent): void {
    this.renderer.addClass(this.document.body, 'loader-none');
    let params: Params = {
      paginate: 8,
      field: 'quantity',
      sort: 'asc',
    };
    if (data.value) {
      params['category_ids'] = data.value;
    }
    this.productStockLoader = true;
    this.onProductTableChange(params);
  }

  onProductActionClicked(action: TableClickedAction): void {
    if (action.actionToPerform == 'edit') {
      this.productEdit(action.data);
    }
  }

  productEdit(data: Product): void {
    this.router.navigateByUrl(`/product/edit/${data.id}`);
  }

  filterOrder(data: Select2UpdateEvent): void {
    const filterBy =
      data.value !== undefined && data.value !== null && data.value !== '' ? String(data.value) : 'all_time';
    this.dashboardFilterBy = filterBy;
    const item = this.findPeriodOption(filterBy);
    this.filterType = item?.label ?? filterBy;

    this.renderer.addClass(this.document.body, 'loader-none');
    this.topProductLoader = true;
    this.store.dispatch(new GetStatisticsCount({ filter_by: filterBy }));
    this.store.dispatch(new GetRevenueChart({ filter_by: filterBy }));
    this.store.dispatch(new GetProducts({ status: 1, top_selling: 1, filter_by: filterBy, paginate: 5 })).subscribe({
      complete: () => {
        this.topProductLoader = false;
      },
    });
  }

  redirectToProduct(id: number): void {
    this.router.navigate(['/product/edit', id]);
  }

  downloadDashboardSalesReport(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const statistics = this.store.selectSnapshot(DashboardState.statistics);
    const revenueChart = this.store.selectSnapshot(DashboardState.revenueChart);
    const topSellingProducts = this.store.selectSnapshot(ProductState.topSellingProducts) ?? [];
    const recentOrders = this.store.selectSnapshot(OrderState.order)?.data ?? [];
    const productStock = this.store.selectSnapshot(ProductState.product)?.data ?? [];

    const report = {
      generated_at: new Date().toISOString(),
      source: 'dashboard',
      filter_by: this.filterType || 'all_time',
      statistics,
      revenue_chart: revenueChart,
      top_selling_products: topSellingProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sales_count: this.getSalesCount(product),
        raw_orders_count: product.orders_count,
        order_amount: product.order_amount,
        sale_price: product.sale_price,
        quantity: product.quantity,
      })),
      recent_orders: recentOrders,
      product_stock_report: productStock,
    };

    const esc = (value: unknown): string =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatCurrency = (value: unknown): string => this.currencySymbolPipe.transform(this.toNumber(value));
    const formatDate = (value: unknown): string => {
      const date = new Date(String(value ?? ''));
      if (Number.isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleString('es-CO');
    };

    const stats = report.statistics ?? ({} as StatisticsCount);
    const statsCards = [
      { label: 'Ingresos totales', value: formatCurrency(stats.total_revenue) },
      { label: 'Pedidos totales', value: esc(stats.total_orders) },
      { label: 'Productos totales', value: esc(stats.total_products) },
      { label: 'Usuarios totales', value: esc(stats.total_users) },
      { label: 'Reembolsos totales', value: esc(stats.total_refunds) },
    ]
      .map(
        (item) =>
          `<div class="kpi"><div class="kpi-label">${item.label}</div><div class="kpi-value">${item.value}</div></div>`,
      )
      .join('');

    const revenueMonths = report.revenue_chart?.months ?? [];
    const revenueSeries = report.revenue_chart?.revenues ?? [];
    const commissionSeries = report.revenue_chart?.commissions ?? [];
    const revenueRows = revenueMonths.length
      ? revenueMonths
          .map(
            (month, i) => `
            <tr>
              <td>${esc(month)}</td>
              <td class="right">${formatCurrency(revenueSeries[i] ?? 0)}</td>
              <td class="right">${formatCurrency(commissionSeries[i] ?? 0)}</td>
            </tr>
          `,
          )
          .join('')
      : `<tr><td colspan="3" class="empty">Sin datos de ingresos</td></tr>`;

    const topRows = report.top_selling_products.length
      ? report.top_selling_products
          .map(
            (product) => `
            <tr>
              <td>${esc(product.name)}</td>
              <td class="right">${esc(product.sales_count)}</td>
              <td class="right">${formatCurrency(product.order_amount)}</td>
              <td class="right">${formatCurrency(product.sale_price)}</td>
              <td class="right">${esc(product.quantity)}</td>
            </tr>
          `,
          )
          .join('')
      : `<tr><td colspan="5" class="empty">Sin productos en el listado</td></tr>`;

    const recentRows = report.recent_orders.length
      ? report.recent_orders
          .slice(0, 15)
          .map(
            (order: Order) => `
            <tr>
              <td>#${esc(order.order_number)}</td>
              <td>${esc(order.consumer?.name || '-')}</td>
              <td>${esc(order.payment_status || '-')}</td>
              <td class="right">${formatCurrency(order.total)}</td>
              <td>${formatDate(order.created_at)}</td>
            </tr>
          `,
          )
          .join('')
      : `<tr><td colspan="5" class="empty">Sin pedidos recientes</td></tr>`;

    const title = `Informe de ventas dashboard - ${new Date().toISOString().slice(0, 10)}`;
    const css = `
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        p { margin-top: 0; color: #6b7280; margin-bottom: 16px; }
        h2 { font-size: 15px; margin-top: 20px; margin-bottom: 8px; }
        .meta { font-size: 12px; color: #6b7280; margin-bottom: 18px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .kpi {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          background: #f9fafb;
        }
        .kpi-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .kpi-value { font-size: 18px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
        td.right, th.right { text-align: right; }
        td.empty { text-align: center; color: #6b7280; }
      </style>
    `;

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          ${css}
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generado automáticamente desde el dashboard.</p>
          <div class="meta">
            Fecha de generación: ${esc(formatDate(report.generated_at))}<br/>
            Filtro aplicado: ${esc(report.filter_by)}<br/>
            Fuente: ${esc(report.source)}
          </div>
          <h2>Estadísticas</h2>
          <div class="kpi-grid">${statsCards}</div>
          <h2>Gráfica de ingresos</h2>
          <table>
            <thead>
              <tr>
                <th>Mes</th>
                <th class="right">Ingresos</th>
                <th class="right">Comisiones</th>
              </tr>
            </thead>
            <tbody>${revenueRows}</tbody>
          </table>
          <h2>Top productos</h2>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th class="right">Pedidos</th>
                <th class="right">Monto vendido</th>
                <th class="right">Precio</th>
                <th class="right">Stock</th>
              </tr>
            </thead>
            <tbody>${topRows}</tbody>
          </table>
          <h2>Pedidos recientes</h2>
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Pago</th>
                <th class="right">Total</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>${recentRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'loader-none');
    this.apexChart?.destroy();
  }
}
