import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NavService } from '../../../services/nav.service';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { SidebarMenuSkeletonComponent } from '../../ui/skeleton/sidebar-menu-skeleton/sidebar-menu-skeleton.component';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngxs/store';
import { GetUserDetails } from 'src/app/shared/store/action/account.action';
import { GetNotification } from 'src/app/shared/store/action/notification.action';
import { GetBadges } from 'src/app/shared/store/action/sidebar.action';

@Component({
    selector: 'app-content',
    imports: [RouterModule, HeaderComponent, FooterComponent,
        SidebarMenuSkeletonComponent, SidebarComponent, RouterModule
    ],
    templateUrl: './content.component.html',
    styleUrl: './content.component.scss'
})
export class ContentComponent {

  public isBrowser: boolean;

  constructor(
      public navServices: NavService,
      private router: Router,
      private store: Store,
      @Inject(PLATFORM_ID) private platformId: Object) {
    this.navServices.sidebarLoading = true;
      this.store.dispatch(new GetBadges());
      this.store.dispatch(new GetNotification());
      this.store.dispatch(new GetUserDetails()).subscribe({
        complete: () => {
          this.navServices.sidebarLoading = false;
        },
      });
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if(event.url === '/order/create'){
          this.navServices.collapseSidebar = true;
        }
      }
    })
  }

}
