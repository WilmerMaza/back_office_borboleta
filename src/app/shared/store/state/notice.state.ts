import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { Notice } from "../../interface/notice.interface";
import { CreateNotice, DeleteNotice, EditNotice, GetNotice, MarkAsReadNotice, ResentNotice, UpdateNotice } from "../action/notice.action";
import { NoticeService } from "../../services/notice.service";

export class NoticeStateModel {
  notice = {
    data: [] as Notice[],
    total: 0
  }
  selectedNotice: Notice | null;
  recentNotice: Notice | null;
}

@State<NoticeStateModel>({
  name: "notice",
  defaults: {
    notice: {
      data: [],
      total: 0
    },
    selectedNotice: null,
    recentNotice: null
  },
})
@Injectable()
export class NoticeState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private noticeService: NoticeService) {}

  @Selector()
  static notice(state: NoticeStateModel) {
    return state.notice;
  }

  @Selector()
  static selectedNotice(state: NoticeStateModel) {
    return state.selectedNotice;
  }

  @Selector()
  static recentNotice(state: NoticeStateModel) {
    return state.recentNotice;
  }


  @Action(GetNotice)
  getNotices(ctx: StateContext<NoticeStateModel>, action: GetNotice) {
    return this.noticeService.getNotice(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            notice: {
              data: result.data,
              total: result?.total ? result?.total : result.data?.length
            },
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateNotice)
  create(ctx: StateContext<NoticeStateModel>, action: CreateNotice) {
    // Create Notice Logic Here
  }

  @Action(EditNotice)
  edit(ctx: StateContext<NoticeStateModel>, { id }: EditNotice) {
    return this.noticeService.getNotice().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(notice => notice.id == id);
          ctx.patchState({
            ...state,
            selectedNotice: result,
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(ResentNotice)
  recentNotice(ctx: StateContext<NoticeStateModel>, { id }: ResentNotice) {
    return this.noticeService.getNotice().pipe(
      tap({
        next: result => { 
          ctx.patchState({
            recentNotice: result.data.length ? result.data[0] : null 
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateNotice)
  update(ctx: StateContext<NoticeStateModel>, { payload, id }: UpdateNotice) {
    // Update Notice Logic Here
  }

  @Action(MarkAsReadNotice)
  markAsRead(ctx: StateContext<NoticeStateModel>, { id }: MarkAsReadNotice) {
    // Mark As Read Logic Here
  }

  @Action(DeleteNotice)
  delete(ctx: StateContext<NoticeStateModel>, { id }: DeleteNotice) {
    // Delete Notice Logic Here
  }
 

}
