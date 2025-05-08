import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { FaqService } from "../../services/faq.service";
import { Faq } from "../../interface/faq.interface";
import { CreateFaq, DeleteAllFaq, DeleteFaq,
         EditFaq, GetFaqs, UpdateFaq,
         UpdateFaqStatus } from "../action/faq.action";

export class FaqStateModel {
  faq = {
    data: [] as Faq[],
    total: 0
  }
  selectedFaq: Faq | null;
}

@State<FaqStateModel>({
  name: "faq",
  defaults: {
    faq: {
      data: [],
      total: 0
    },
    selectedFaq: null
  },
})
@Injectable()
export class FaqState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private faqService: FaqService) {}

  @Selector()
  static faq(state: FaqStateModel) {
    return state.faq;
  }

  @Selector()
  static selectedFaq(state: FaqStateModel) {
    return state.selectedFaq;
  }

  @Action(GetFaqs)
  getFaqs(ctx: StateContext<FaqStateModel>, action: GetFaqs) {
    return this.faqService.getFaqs(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            faq: {
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

  @Action(CreateFaq)
  create(ctx: StateContext<FaqStateModel>, action: CreateFaq) {
    // Create FAQ logic here
  }

  @Action(EditFaq)
  edit(ctx: StateContext<FaqStateModel>, { id }: EditFaq) {
    return this.faqService.getFaqs().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(faq => faq.id == id);
          ctx.patchState({
            ...state,
            selectedFaq: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateFaq)
  update(ctx: StateContext<FaqStateModel>, { payload, id }: UpdateFaq) {
    // Update FAQ logic here
  }

  @Action(UpdateFaqStatus)
  updateStatus(ctx: StateContext<FaqStateModel>, { id, status }: UpdateFaqStatus) {
    // Update FAQ status logic here

  }

  @Action(DeleteFaq)
  delete(ctx: StateContext<FaqStateModel>, { id }: DeleteFaq) {
    // Delete FAQ logic here
  }

  @Action(DeleteAllFaq)
  deleteAll(ctx: StateContext<FaqStateModel>, { ids }: DeleteAllFaq) {
    // Delete all FAQ logic here
  }

}
