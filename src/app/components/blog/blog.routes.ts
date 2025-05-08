
import { Routes } from '@angular/router';

import { BlogComponent } from './blog.component';
import { CreateBlogComponent } from './create-blog/create-blog.component';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { BlogCategoryComponent } from './category/blog-category/blog-category.component';
import { EditBlogCategoryComponent } from './category/edit-blog-category/edit-blog-category.component';
import { BlogTagComponent } from './tag/blog-tag/blog-tag.component';
import { CreateBlogTagComponent } from './tag/create-blog-tag/create-blog-tag.component';
import { EditBlogTagComponent } from './tag/edit-blog-tag/edit-blog-tag.component';

export const blogRoutes: Routes = [
  {
    path: "",
    component: BlogComponent
  },
  {
    path: "create",
    component: CreateBlogComponent
  },
  {
    path: "edit/:id",
    component: EditBlogComponent
  },
  {
    path: "category",
    component: BlogCategoryComponent
  },
  {
    path: "category/edit/:id",
    component: EditBlogCategoryComponent
  },
  {
    path: "tag",
    component: BlogTagComponent
  },
  {
    path: "tag/create",
    component: CreateBlogTagComponent
  },
  {
    path: "tag/edit/:id",
    component: EditBlogTagComponent
  }
];
