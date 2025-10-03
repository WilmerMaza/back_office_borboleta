import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetUsers, CreateUser, EditUser, UpdateUser, 
          UpdateUserStatus, DeleteUser, DeleteAllUser, 
          CreateUserAddress, ImportUser, ExportUser } from "../action/user.action";
import { User } from "../../interface/user.interface";
import { UserService } from "../../services/user.service";
import { AddressService } from "../../services/address.service";
import { NotificationService } from "../../services/notification.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

export class UserStateModel {
  user = {
    data: [] as User[],
    total: 0
  }
  selectedUser: User | null;
}

@State<UserStateModel>({
  name: "user",
  defaults: {
    user: {
      data: [],
      total: 0
    },
    selectedUser: null
  },
})
@Injectable()
export class UserState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private userService: UserService,
    private addressService: AddressService,
    private modalService: NgbModal) {}

  @Selector()
  static user(state: UserStateModel) {
    return state.user;
  }

  @Selector()
  static users(state: UserStateModel) {
    if (state.user?.data && Array.isArray(state.user.data)) {
      return state.user.data.map(user => {
        return { label: user?.name, value: user?.id }
      });
    }
    return [];
  }

  @Selector()
  static selectedUser(state: UserStateModel) {
    return state.selectedUser;
  }

  @Action(GetUsers)
  getUsers(ctx: StateContext<UserStateModel>, action: GetUsers) {
    return this.userService.getUsers(action?.payload).pipe(
      tap({
        next: result => {
          const dataObj = (result as any)?.data;
          const list = Array.isArray(dataObj)
            ? dataObj
            : Array.isArray(dataObj?.data)
              ? dataObj.data
              : Array.isArray(dataObj?.admin_users)
                ? dataObj.admin_users
                : [];
          const total = (result as any)?.total
            ?? dataObj?.total
            ?? dataObj?.pagination?.total
            ?? list.length
            ?? 0;

          ctx.patchState({
            user: {
              data: list,
              total: total
            }
          });
        },
        error: err => { 
          console.error('Error al obtener usuarios:', err);
          // No lanzar error para evitar romper la aplicación
          // En su lugar, retornar un array vacío
          ctx.patchState({
            user: {
              data: [],
              total: 0
            }
          });
        }
      })
    );
  }

  @Action(CreateUser)
  create(ctx: StateContext<UserStateModel>, action: CreateUser) {
    // Usar el role_id del formulario, no forzar 'consumer'
    const userData = { ...action.payload };
    return this.userService.createUser(userData).pipe(
      tap({
        next: result => { 
          // Recargar la lista de usuarios
          this.store.dispatch(new GetUsers({ status: 1, paginate: 15 }));
          // Cerrar el modal
          this.modalService.dismissAll();
        },
        error: err => { 
          console.error('Error al crear usuario:', err);
          throw new Error(err?.error?.message || 'Error al crear el usuario');
        }
      })
    );
  }

  @Action(EditUser)
  edit(ctx: StateContext<UserStateModel>, { id }: EditUser) {
    return this.userService.getUsers().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(user => user.id == id);
          ctx.patchState({
            ...state,
            selectedUser: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateUser)
  update(ctx: StateContext<UserStateModel>, { payload, id }: UpdateUser) {
    // Update User Logic Here
  }

  @Action(UpdateUserStatus)
  updateStatus(ctx: StateContext<UserStateModel>, { id, status }: UpdateUserStatus) {
    // Update User Status Logic Here
  }

  @Action(DeleteUser)
  delete(ctx: StateContext<UserStateModel>, { id }: DeleteUser) {
    return this.userService.deleteUser(id).pipe(
      tap({
        next: () => {
          // Actualizar la lista de usuarios después de eliminar
          const currentState = ctx.getState();
          const updatedUsers = currentState.user.data.filter(user => user.id !== id);
          ctx.patchState({
            user: {
              ...currentState.user,
              data: updatedUsers,
              total: updatedUsers.length
            }
          });
        },
        error: err => {
          console.error('Error al eliminar usuario:', err);
          this.notificationService.notification = true;
        }
      })
    );
  }

  @Action(DeleteAllUser)
  deleteAll(ctx: StateContext<UserStateModel>, { ids }: DeleteAllUser) {
    // Delete All User Logic Here
  }

  @Action(ImportUser)
  import(ctx: StateContext<UserStateModel>, action: ImportUser) {
    // Import User Logic Here
  }

  @Action(ExportUser)
  export(ctx: StateContext<UserStateModel>, action: ExportUser) {
    // Export User Logic Here
  }

  @Action(CreateUserAddress)
  createUserAddress(ctx: StateContext<UserStateModel>, action: CreateUserAddress) {
    console.log('CreateUserAddress action ejecutada con payload:', action.payload);
    return this.addressService.createAddress(action.payload).pipe(
      tap({
        next: result => { 
          console.log('Dirección creada exitosamente:', result);
          // Recargar la lista de usuarios para obtener las nuevas direcciones
          this.store.dispatch(new GetUsers({ role: 'consumer', status: 1, paginate: 15 }));
          // Cerrar el modal
          this.modalService.dismissAll();
        },
        error: err => { 
          console.error('Error al crear dirección:', err);
          throw new Error(err?.error?.message || 'Error al crear la dirección');
        }
      })
    );
  }

}
