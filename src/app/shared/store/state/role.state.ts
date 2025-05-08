import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetRoles, GetRoleModules, CreateRole, EditRole, 
  UpdateRole, DeleteRole, DeleteAllRole } from "../action/role.action";
import { Role, Module } from "../../interface/role.interface";
import { RoleService } from "../../services/role.service";
import { NotificationService } from "../../services/notification.service";

export class RoleStateModel {
  role = {
    data: [] as Role[],
    total: 0
  }
  selectedRole: Role | null;
  modules: Module[];
}

@State<RoleStateModel>({
  name: "role",
  defaults: {
    role: {
      data: [],
      total: 0
    },
    selectedRole: null,
    modules: []
  },
})
@Injectable()
export class RoleState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private roleService: RoleService) {}

  @Selector()
  static role(state: RoleStateModel) {
    return state.role;
  }

  @Selector()
  static roles(state: RoleStateModel) {
    return state.role.data.map(res => { 
      return { label: res?.name, value: res?.id }
    }).filter(value => value.label !== 'admin' && value.label !== 'vendor');
  }

  @Selector()
  static selectedRole(state: RoleStateModel) {
    return state.selectedRole;
  }

  @Selector()
  static roleModules(state: RoleStateModel) {
    return state.modules;
  }

  @Action(GetRoles)
  getRoles(ctx: StateContext<RoleStateModel>, action: GetRoles) {
    return this.roleService.getRoles(action?.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            role: {
              data: result.data,
              total: result?.total ? result?.total : result.data.length
            }
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(GetRoleModules)
  getRoleModules(ctx: StateContext<RoleStateModel>) {
    return this.roleService.getRoleModules().pipe(
      tap({
        next: result => { 
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            modules: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateRole)
  create(ctx: StateContext<RoleStateModel>, action: CreateRole) {
    // Create Role Logic Here
  }

  @Action(EditRole)
  edit(ctx: StateContext<RoleStateModel>, { id }: EditRole) {
    return this.roleService.getRoles().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(role => role.id == id);
          ctx.patchState({
            ...state,
            selectedRole: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateRole)
  update(ctx: StateContext<RoleStateModel>, { payload, id }: UpdateRole) {
    // Update Role Logic Here
  }

  @Action(DeleteRole)
  delete(ctx: StateContext<RoleStateModel>, { id }: DeleteRole) {
    // Delete Role Logic Here
  }

  @Action(DeleteAllRole)
  deleteAll(ctx: StateContext<RoleStateModel>, { ids }: DeleteAllRole) {
    // Delete All Role Logic Here
  }

}
