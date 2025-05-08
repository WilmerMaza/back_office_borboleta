import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, Input, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HasPermissionDirective } from '../../directive/has-permission.directive';
import { AccountUser } from '../../interface/account.interface';
import { Permission } from '../../interface/role.interface';
import { Values } from '../../interface/setting.interface';
import { Sidebar, SidebarModel } from '../../interface/sidebar.interface';
import { NavService } from '../../services/nav.service';
import { GetSidebar } from '../../store/action/sidebar.action';
import { AccountState } from '../../store/state/account.state';
import { SettingState } from '../../store/state/setting.state';
import { SidebarState } from '../../store/state/sidebar.state';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule, TranslateModule, HasPermissionDirective],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  @Input() class: string;

  user$: Observable<AccountUser> = inject(Store).select(AccountState.user);
  permissions$: Observable<Permission[]> = inject(Store).select(AccountState.permissions);
  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;
  menu$: Observable<SidebarModel> = inject(Store).select(SidebarState.menu);

  public item: Sidebar;
  public menuItems: Sidebar[] = [];
  public permissions: string[] = [];
  public sidebarTitleKey: string = 'sidebar';
  public width: any
  public role: string;

  constructor(public navServices: NavService,
    private router: Router,
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: object) {
    this.store.dispatch(new GetSidebar())
    this.menu$.subscribe((menuItems) => {
      this.menuItems = menuItems?.data;
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.menuItems?.forEach((menu: Sidebar) => {
              menu.active = false;
              this.activeMenuRecursive(menu, (event.url.split("?")[0].toString().split("/")[1].toString()));
          });
        }
      });
    });
    this.user$.subscribe(user => this.role = user?.role?.name);
  }

  hasMainLevelMenuPermission(acl_permission?: string[]) {
    let status = true;
    if(acl_permission?.length) {
      this.permissions$.subscribe(permission => {
        this.permissions = permission?.map((value: Permission) => value?.name);
        if(!acl_permission?.some(action => this.permissions?.includes(<any>action))) {
          status = false;
        }
      });
    }
    return status;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }

  onItemSelected(item: Sidebar, onRoute: boolean = false) {
    this.menuItems.forEach((menu: Sidebar) => {
      this.deActiveAllMenu(menu, item);
    });
    if(!onRoute)
      item.active = !item.active;
  }

  activeMenuRecursive(menu: Sidebar, url: string, item?: Sidebar) {
    if(menu && menu.path && menu.path == (url.charAt(0) !== '/' ? '/'+url : url)) {
      if(item) {
        item.active = true;
        this.onItemSelected(item, true);
      }
      menu.active = true;
    }
    if(menu?.children?.length) {
      menu?.children.forEach((child: Sidebar) => {
        this.activeMenuRecursive(child, (url.charAt(0) !== '/' ? '/'+url : url.toString()), menu)
      })
    }
  }

  deActiveAllMenu(menu: Sidebar, item: Sidebar) {
    if(menu && menu.active && menu.id != item.id) {
      menu.active = false;
    }
    if(menu?.children?.length) {
      menu?.children.forEach((child: Sidebar) => {
        this.deActiveAllMenu(child, item)
      })
    }
  }

  closeSidebar(){
    if(isPlatformBrowser(this.platformId)) {
      if(window.innerWidth < 992){
        this.navServices.collapseSidebar = false;
      }
    }
  }

}
