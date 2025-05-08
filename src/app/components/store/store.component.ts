import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { Params, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { TableComponent } from '../../shared/components/ui/table/table.component';
import { Values } from '../../shared/interface/setting.interface';
import { Stores, StoresModel } from '../../shared/interface/store.interface';
import { TableClickedAction, TableConfig } from '../../shared/interface/table.interface';
import { ApproveStoreStatus, DeleteAllStore, DeleteStore, GetStores } from '../../shared/store/action/store.action';
import { SettingState } from '../../shared/store/state/setting.state';
import { StoreState } from '../../shared/store/state/store.state';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-store',
    imports: [RouterModule, TranslateModule, HasPermissionDirective,
        PageWrapperComponent, TableComponent
    ],
    templateUrl: './store.component.html',
    styleUrl: './store.component.scss'
})
export class StoreComponent {

  store$: Observable<StoresModel> = inject(Store).select(StoreState.store);
  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  public url: string;

  public tableConfig: TableConfig = {
    columns: [
      { title: "Logo", dataField: "store_logo", class: 'tbl-logo-image', type: 'image', key: 'store_name' },
      { title: "store_name", dataField: "store_name" },
      { title: "name", dataField: "vendor_name" },
      { title: "created_at", dataField: "created_at", type: "date", sortable: true, sort_direction: 'desc' },
      { title: "approved", dataField: "is_approved", type: "switch", canAllow: ['admin'] },
    ],
    rowActions: [
      { label: "Edit", actionToPerform: "edit", icon: "ri-pencil-line", permission: "store.edit"  },
      { label: "Delete", actionToPerform: "delete", icon: "ri-delete-bin-line", permission: "store.destroy"  },
      { label: "View", actionToPerform: "view", icon: "ri-eye-line" }
    ],
    data: [] as Stores[],
    total: 0
  };

  constructor(private store: Store,
    public router: Router, @Inject(PLATFORM_ID) private platformId: object) {
    this.setting$.subscribe(setting => {
      if(setting && setting.general) {
        this.url = setting.general.site_url;
      }
    });
  }

  ngOnInit() {
    this.store$.subscribe(store => {
      let stores = store?.data?.filter((element: Stores) => {
        element.vendor_name = element.vendor.name;
        return element;
      });
      this.tableConfig.data  = stores ? stores : [];
      this.tableConfig.total = store  ? store?.total : 0;
    });
  }

  onTableChange(data?: Params) {
    this.store.dispatch(new GetStores(data));
  }

  onActionClicked(action: TableClickedAction) {
    if(action.actionToPerform == 'edit')
      this.edit(action.data)
    else if(action.actionToPerform == 'is_approved')
      this.approve(action.data)
    else if(action.actionToPerform == 'delete')
      this.delete(action.data)
    else if(action.actionToPerform == 'deleteAll')
      this.deleteAll(action.data)
    else if(action.actionToPerform == 'view')
      this.view(action.data)
  }

  edit(data: Stores) {
    this.router.navigateByUrl(`/store/edit/${data.id}`);
  }

  approve(data: Stores) {
    this.store.dispatch(new ApproveStoreStatus(data.id, data.is_approved))
  }

  delete(data: Stores) {
    this.store.dispatch(new DeleteStore(data.id));
  }

  deleteAll(ids: number[]) {
    this.store.dispatch(new DeleteAllStore(ids));
  }

  view(data: Stores) {
    if(isPlatformBrowser(this.platformId)) {
      window.open(this.url+'/seller/store/'+data.slug, "_blank");
    }
  }

}
