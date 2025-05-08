import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NotificationState } from '../../shared/store/state/notification.state';
import { GetNotification, MarkAsReadNotification } from '../../shared/store/action/notification.action';
import { Notification } from "../../shared/interface/notification.interface";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';

@Component({
    selector: 'app-notification',
    imports: [CommonModule, PageWrapperComponent],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss'
})
export class NotificationComponent {

  notification$: Observable<Notification[]> = inject(Store).select(NotificationState.notification);

  public isBrowser: boolean;

  constructor(private store: Store, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.store.dispatch(new GetNotification());
  }

  ngOnDestroy() {
    if(this.isBrowser) {
      this.store.dispatch(new MarkAsReadNotification());
    }
  }

}
