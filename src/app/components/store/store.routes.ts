
import { Routes } from '@angular/router';

import { StoreComponent } from './store.component';
import { CreateStoreComponent } from './create-store/create-store.component';
import { EditStoreComponent } from './edit-store/edit-store.component';

export const storeRoutes: Routes = [
  {
    path: "",
    component: StoreComponent
  },
  {
    path: "create",
    component: CreateStoreComponent
  },
  {
    path: "edit/:id",
    component: EditStoreComponent
  }
];
