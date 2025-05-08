import { Component, inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NotificationState } from '../../../../store/state/notification.state';
import { Observable } from 'rxjs';
import { Notification } from '../../../../../shared/interface/notification.interface';
import { NavService } from '../../../../services/nav.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SummaryPipe } from '../../../../pipe/summary.pipe';

@Component({
    selector: 'app-notification',
    imports: [CommonModule, TranslateModule, RouterModule,
        SummaryPipe
    ],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss'
})
export class NotificationComponent {

  notification$: Observable<Notification[]> = inject(Store).select(NotificationState.notification);

  public unreadNotificationCount: number;
  public active: boolean = false;

  constructor( public navServices: NavService ) {
    this.notification$.subscribe((notification) => {
      this.unreadNotificationCount = notification?.filter(item => !item.read_at)?.length;
    });
  }

  clickHeaderOnMobile(){
    this.active= !this.active
  }

}
