import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetPages, CreatePage, EditPage, 
         UpdatePage, UpdatePageStatus, DeletePage, 
         DeleteAllPage } from "../action/page.action";
import { Page } from "../../interface/page.interface";
import { PageService } from "../../services/page.service";
import { NotificationService } from "../../services/notification.service";

export class PageStateModel {
  page = {
    data: [] as Page[],
    total: 0
  }
  selectedPage: Page | null;
}

@State<PageStateModel>({
  name: "page",
  defaults: {
    page: {
      data: [],
      total: 0
    },
    selectedPage: null
  },
})
@Injectable()
export class PageState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private pageService: PageService) {}

  @Selector()
  static page(state: PageStateModel) {
    return state.page;
  }

  @Selector()
  static pages(state: PageStateModel) {
    return state.page.data.map(res => { 
      return { label: res?.title, value: res?.slug }
    });
  }

  @Selector()
  static selectedPage(state: PageStateModel) {
    return state.selectedPage;
  }

  @Action(GetPages)
  getPages(ctx: StateContext<PageStateModel>, action: GetPages) {
    return this.pageService.getPages(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            page: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length
            }
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreatePage)
  create(ctx: StateContext<PageStateModel>, action: CreatePage) {
    // Create Page Logic Here
  }

  @Action(EditPage)
  edit(ctx: StateContext<PageStateModel>, { id }: EditPage) {
    return this.pageService.getPages().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(page => page.id == id);

          ctx.patchState({
            ...state,
            selectedPage: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdatePage)
  update(ctx: StateContext<PageStateModel>, { payload, id }: UpdatePage) {
    // Update Page Logic Here
  }

  @Action(UpdatePageStatus)
  updateStatus(ctx: StateContext<PageStateModel>, { id, status }: UpdatePageStatus) {
    // Update Page Status Logic Here
  }

  @Action(DeletePage)
  delete(ctx: StateContext<PageStateModel>, { id }: DeletePage) {
    // Delate Page Logic Here
  }

  @Action(DeleteAllPage)
  deleteAll(ctx: StateContext<PageStateModel>, { ids }: DeleteAllPage) {
    // Delete All Page Logic Here
  }

}
