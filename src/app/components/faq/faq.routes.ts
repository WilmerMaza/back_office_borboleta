import { Routes } from '@angular/router';
import { CreateFaqComponent } from './create-faq/create-faq.component';
import { EditFaqComponent } from './edit-faq/edit-faq.component';
import { FaqComponent } from './faq.component';

export const faqRoutes: Routes = [
  {
    path: '',
    component: FaqComponent
  },
  {
    path: "create",
    component: CreateFaqComponent
  },
  {
    path: "edit/:id",
    component: EditFaqComponent
  }
];
