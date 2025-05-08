import { Routes } from '@angular/router';
import { EditMenuComponent } from './edit-menu/edit-menu.component';
import { MenuComponent } from './menu.component';

export const MenuRoutes: Routes = [
    {
      path: "",
      component: MenuComponent
    },
    {
      path: "edit/:id",
      component: EditMenuComponent
    }
];
