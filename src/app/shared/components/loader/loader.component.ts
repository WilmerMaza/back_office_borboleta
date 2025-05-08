import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-loader',
    imports: [TranslateModule],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent {

  @Input() loaderClass: string = 'loader-wrapper';
  
}
