import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { NotificationService } from "../../services/notification.service";
import { QuestionsAnswersService } from "../../services/questions-answers.service";
import { GetQuestionAnswers, EditQuestionAnswers, UpdateQuestionAnswers, 
    DeleteAllQuestionAnswers, DeleteQuestionAnswers } from "../action/questions-answers.action";
import { QuestionAnswers } from "../../interface/questions-answers.interface";

export class QuestionAnswersStateModel {
  question = {
    data: [] as QuestionAnswers[],
    total: 0
  }
  selectedQuestion: QuestionAnswers | null;
}

@State<QuestionAnswersStateModel>({
  name: "question",
  defaults: {
    question: {
      data: [],
      total: 0
    },
    selectedQuestion: null
  },
})
@Injectable()
export class QuestionAnswersState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private questionsAnswersService: QuestionsAnswersService) {}

  @Selector()
  static questionAnswers(state: QuestionAnswersStateModel) {
    return state.question;
  }

  @Selector()
  static selectedQuestionAnswers(state: QuestionAnswersStateModel) {
    return state.selectedQuestion;
  }

  @Action(GetQuestionAnswers)
  getQuestionAnswers(ctx: StateContext<QuestionAnswersStateModel>, action: GetQuestionAnswers) {
    return this.questionsAnswersService.getQuestionAnswers(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            question: {
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

  @Action(EditQuestionAnswers)
  edit(ctx: StateContext<QuestionAnswersStateModel>, { id }: EditQuestionAnswers) {
    return this.questionsAnswersService.getQuestionAnswers().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(qna => qna.id == id);
          ctx.patchState({
            ...state,
            selectedQuestion: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateQuestionAnswers)
  update(ctx: StateContext<QuestionAnswersStateModel>, { payload, id }: UpdateQuestionAnswers) {
    // Update Question Answers Logic Here
  }

  @Action(DeleteQuestionAnswers)
  delete(ctx: StateContext<QuestionAnswersStateModel>, { id }: DeleteQuestionAnswers) {
    // Delete Question Answers Logic Here
  }

  @Action(DeleteAllQuestionAnswers)
  deleteAll(ctx: StateContext<QuestionAnswersStateModel>, { ids }: DeleteAllQuestionAnswers) {
    // Delete All Question Answers Logic Here
  }
}
