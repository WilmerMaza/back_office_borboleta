import { Routes } from "@angular/router";
import { CreateNoticeComponent } from "./create-notice/create-notice.component";
import { EditNoticeComponent } from "./edit-notice/edit-notice.component";
import { NoticeComponent } from "./notice.component";

export const noticeRoutes: Routes = [
  {
    path: '',
    component: NoticeComponent
  },
  {
    path: "create",
    component: CreateNoticeComponent
  },
  {
    path: "edit/:id",
    component: EditNoticeComponent
  }
];
