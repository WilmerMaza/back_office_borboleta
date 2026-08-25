import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Values } from '../../interface/setting.interface';
import { NavService } from '../../services/nav.service';
import { SettingState } from '../../store/state/setting.state';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { SearchComponent } from './widgets/search/search.component';
import { QuickViewComponent } from './widgets/quick-view/quick-view.component';
import { ModeComponent } from './widgets/mode/mode.component';
import { ProfileComponent } from './widgets/profile/profile.component';
import { HasPermissionDirective } from '../../directive/has-permission.directive';

@Component({
  selector: "app-header",
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SearchComponent,
    QuickViewComponent,
    ModeComponent,
    ProfileComponent,
    HasPermissionDirective,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  setting$: Observable<Values> = inject(Store).select(
    SettingState.setting
  ) as Observable<Values>;

  public active: boolean = false;
  public profileOpen: boolean = false;
  public open: boolean = false;

  public url: string;

  constructor(
    public navServices: NavService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.setting$.subscribe((setting) => {
      if (setting && setting.general) {
        this.url = setting.general.site_url;
        this.document.body.classList.add(setting.general.mode!);
      }
    });
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }

  clickHeaderOnMobile() {
    this.navServices.search = true;
  }
}
