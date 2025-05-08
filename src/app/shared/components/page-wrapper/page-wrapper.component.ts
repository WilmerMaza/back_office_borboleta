import { Component, inject, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoaderState } from '../../store/state/loader.state';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '../loader/loader.component';

@Component({
    selector: 'app-page-wrapper',
    imports: [CommonModule, TranslateModule, LoaderComponent],
    templateUrl: './page-wrapper.component.html',
    styleUrl: './page-wrapper.component.scss'
})
export class PageWrapperComponent {

  @Input() title: string;
  @Input() grid: boolean = true;
  @Input() gridClass: string = 'col-xxl-8 col-xl-10 m-auto';

  loadingStatus$: Observable<boolean> = inject(Store).select(LoaderState.status) as Observable<boolean>;

}
