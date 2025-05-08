
import { Routes } from '@angular/router';

import { LicenseKeyComponent } from './license-key.component';
import { CreateLicenseKeyComponent } from './create-license-key/create-license-key.component';
import { EditLicenseKeyComponent } from './edit-license-key/edit-license-key.component';

export const licenseKeyRoutes: Routes = [
  {
    path: '',
    component: LicenseKeyComponent
  },
  {
    path: "create",
    component: CreateLicenseKeyComponent
  },
  {
    path: "edit/:id",
    component: EditLicenseKeyComponent
  }
];
