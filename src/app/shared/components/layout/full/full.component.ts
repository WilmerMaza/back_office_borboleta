import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-full',
    imports: [RouterModule],
    templateUrl: './full.component.html',
    styleUrl: './full.component.scss'
})
export class FullComponent {

  public isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

}
