import { Component, inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SettingState } from '../../../../store/state/setting.state';
import { Observable } from 'rxjs';
import { Values } from '../../../../interface/setting.interface';

@Component({
    selector: 'app-mode',
    imports: [],
    templateUrl: './mode.component.html',
    styleUrl: './mode.component.scss'
})
export class ModeComponent {

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  public mode: boolean;

  constructor(){
    this.setting$.subscribe(res => this.mode = res && res.general && res.general.mode === 'dark-only' ? true : false)
  }

  customizeLayoutDark() {
    this.mode = !this.mode;
    document.body.classList.toggle('dark-only');
  }

}
