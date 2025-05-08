import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../../shared/components/page-wrapper/page-wrapper.component';
import { FormLicenseKeyComponent } from '../form-license-key/form-license-key.component';

@Component({
    selector: 'app-create-license-key',
    imports: [PageWrapperComponent, FormLicenseKeyComponent],
    templateUrl: './create-license-key.component.html',
    styleUrl: './create-license-key.component.scss'
})
export class CreateLicenseKeyComponent {

}
