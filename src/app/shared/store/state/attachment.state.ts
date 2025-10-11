import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetAttachments, CreateAttachment, DeleteAttachment, DeleteAllAttachment } from "../action/attachment.action";
import { AttachmentService } from "../../services/attachment.service";
import { NotificationService } from "../../services/notification.service";
import { AttachmentModel } from "../../interface/attachment.interface";

export class AttachmentStateModel {
  attachment: AttachmentModel
}

@State<AttachmentStateModel>({
  name: "attachment",
  defaults: {
    attachment: {
      data: [],
      total: 0
    }
  },
})
@Injectable()
export class AttachmentState {
  
  constructor(private store: Store, 
    private notificationService: NotificationService,
    private attachmentService: AttachmentService) {}

  @Selector()
  static attachment(state: AttachmentStateModel) {
    return state.attachment;
  }

  @Action(GetAttachments)
  getAttachments(ctx: StateContext<AttachmentStateModel>, action: GetAttachments) {
    return this.attachmentService.getAttachments(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            attachment: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateAttachment)
  create(ctx: StateContext<AttachmentStateModel>, action: CreateAttachment) {
    console.log('🎬 CreateAttachment Action - Iniciando subida');
    console.log('📦 Cantidad de archivos:', action.payload.length);
    
    return this.attachmentService.createAttachment(action.payload).pipe(
      tap({
        next: result => {
          console.log('✅ Respuesta del backend:', result);
          console.log('📸 Archivos subidos exitosamente');
          
          this.notificationService.showSuccess('Archivos subidos correctamente');
          // Recargar la lista de attachments
          this.store.dispatch(new GetAttachments({ page: 1, paginate: 15 }));
        },
        error: err => {
          console.error('❌ Error al subir archivos:', err);
          console.error('📋 Detalles del error:', err?.error);
          
          this.notificationService.showError(err?.error?.message || 'Error al subir archivos');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteAttachment)
  delete(ctx: StateContext<AttachmentStateModel>, { id }: DeleteAttachment) {
    return this.attachmentService.deleteAttachment(id).pipe(
      tap({
        next: result => { 
          this.notificationService.showSuccess('Archivo eliminado correctamente');
          // Actualizar la lista local
          const currentState = ctx.getState();
          const updatedAttachments = currentState.attachment.data.filter(attachment => attachment.id !== id);
          ctx.patchState({
            attachment: {
              ...currentState.attachment,
              data: updatedAttachments,
              total: currentState.attachment.total - 1
            }
          });
        },
        error: err => { 
          this.notificationService.showError(err?.error?.message || 'Error al eliminar archivo');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteAllAttachment)
  deleteAll(ctx: StateContext<AttachmentStateModel>, { ids }: DeleteAllAttachment) {
    return this.attachmentService.deleteAllAttachments(ids).pipe(
      tap({
        next: result => { 
          this.notificationService.showSuccess('Archivos eliminados correctamente');
          // Recargar la lista de attachments
          this.store.dispatch(new GetAttachments({ page: 1, paginate: 15 }));
        },
        error: err => { 
          this.notificationService.showError(err?.error?.message || 'Error al eliminar archivos');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

}
