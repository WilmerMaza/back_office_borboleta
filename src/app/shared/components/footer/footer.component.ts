import { Component, inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SettingState } from '../../store/state/setting.state';
import { Observable } from 'rxjs';
import { Values } from '../../interface/setting.interface';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    imports: [CommonModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

}
