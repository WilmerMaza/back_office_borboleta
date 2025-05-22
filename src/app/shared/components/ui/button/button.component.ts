import { Component, inject, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoaderState } from '../../../store/state/loader.state';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-button',
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() class: string = 'btn btn-theme ms-auto mt-4';
  @Input() iconClass: string | null;
  @Input() id: string;
  @Input() label: string = 'Submit';
  @Input() type: string  = 'submit';
  @Input() spinner:  boolean = true;
  @Input() disabled: boolean = false;

  public buttonId: string | null;

  spinnerStatus$: Observable<boolean> = inject(Store).select(LoaderState.buttonSpinner) as Observable<boolean>;

  constructor() {
    this.spinnerStatus$.subscribe(res => {
      if(res == false) {
        this.buttonId = null;
      }
    });
  }

  public onClick(id: string): void {
    this.buttonId = id;
  }

  
}
