
import { Routes } from '@angular/router';

import { TagComponent } from './tag.component';
import { CreateTagComponent } from './create-tag/create-tag.component';
import { EditTagComponent } from './edit-tag/edit-tag.component';

export const tagRoutes: Routes = [
  {
    path: "",
    component: TagComponent
  },
  {
    path: "create",
    component: CreateTagComponent
  },
  {
    path: "edit/:id",
    component: EditTagComponent
  },
];
