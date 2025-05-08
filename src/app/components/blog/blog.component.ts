import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { Params, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { TableComponent } from '../../shared/components/ui/table/table.component';
import { HasPermissionDirective } from '../../shared/directive/has-permission.directive';
import { Blog, BlogModel } from '../../shared/interface/blog.interface';
import { Values } from '../../shared/interface/setting.interface';
import { TableClickedAction, TableConfig } from '../../shared/interface/table.interface';
import { DeleteAllBlog, DeleteBlog, GetBlogs, UpdateBlogStatus } from '../../shared/store/action/blog.action';
import { BlogState } from '../../shared/store/state/blog.state';
import { SettingState } from '../../shared/store/state/setting.state';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-blog',
    imports: [TranslateModule, RouterModule, HasPermissionDirective,
        PageWrapperComponent, TableComponent
    ],
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.scss'
})
export class BlogComponent {

  blog$: Observable<BlogModel> = inject(Store).select(BlogState.blog);

  setting$: Observable<Values> = inject(Store).select(SettingState.setting) as Observable<Values>;

  public url: string;

  public tableConfig: TableConfig = {
    columns: [
      { title: "image", dataField: "blog_thumbnail", class: 'tbl-image', type: 'image', placeholder: 'assets/images/product.png' },
      { title: "title", dataField: "title", sortable: true, sort_direction: 'desc' },
      { title: "created_at", dataField: "created_at", type: "date", sortable: true, sort_direction: 'desc' },
      { title: "status", dataField: "status", type: "switch" },
    ],
    rowActions: [
      { label: "Edit", actionToPerform: "edit", icon: "ri-pencil-line", permission: "blog.edit" },
      { label: "Delete", actionToPerform: "delete", icon: "ri-delete-bin-line", permission: "blog.destroy" },
      { label: "View", actionToPerform: "view", icon: "ri-eye-line" }
    ],
    data: [] as Blog[],
    total: 0
  };

  constructor(private store: Store,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: object,) {
    this.setting$.subscribe(setting => {
      if(setting && setting.general) {
        this.url = setting.general.site_url;
      }
    });
  }

  ngOnInit() {
    this.blog$.subscribe(blog => {
      this.tableConfig.data  = blog ? blog?.data  : [];
      this.tableConfig.total = blog ? blog?.total : 0;
    });
  }

  onTableChange(data?: Params) {
    this.store.dispatch(new GetBlogs(data)).subscribe();
  }

  onActionClicked(action: TableClickedAction) {
    if(action.actionToPerform == 'edit')
      this.edit(action.data)
    else if(action.actionToPerform == 'status')
      this.status(action.data)
    else if(action.actionToPerform == 'delete')
      this.delete(action.data)
    else if(action.actionToPerform == 'deleteAll')
      this.deleteAll(action.data)
    else if(action.actionToPerform == 'view')
      this.view(action.data)
  }

  edit(data: Blog) {
    this.router.navigateByUrl(`/blog/edit/${data.id}`);
  }

  status(data: Blog) {
    this.store.dispatch(new UpdateBlogStatus(data.id, data.status))
  }

  delete(data: Blog) {
    this.store.dispatch(new DeleteBlog(data.id))
  }

  deleteAll(ids: number[]) {
    this.store.dispatch(new DeleteAllBlog(ids))
  }

  view(data: Blog) {
    if(isPlatformBrowser(this.platformId)) {
      window.open(this.url+'/blog/'+data.slug, "_blank");
    }
  }

}
