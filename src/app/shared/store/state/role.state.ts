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
    });
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
    return this.roleService.getRoles().pipe(
      tap({
        next: (result: any) => { 
          // Manejar diferentes estructuras de respuesta
          let rolesData: Role[] = [];
          let totalCount = 0;
          
          if (result?.data) {
            if (Array.isArray(result.data)) {
              // Si data es un array directo
              rolesData = result.data;
              totalCount = result.data.length;
            } else if (result.data.roles) {
              // Si data tiene la estructura {roles: [], pagination: {}}
              rolesData = result.data.roles;
              totalCount = result.data.pagination?.total || result.data.roles.length;
            }
          }
          
          ctx.patchState({
            role: {
              data: rolesData,
              total: totalCount
            }
          });
        },
        error: err => { 
          console.error('Error al obtener roles:', err);
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
    return this.roleService.createRole(action.payload).pipe(
      tap({
        next: (result: any) => {
          const state = ctx.getState();
          
          // Extraer el rol desde result.data.role
          const newRole = result?.data?.role || result?.data || result;
          
          // Agregar el nuevo rol al estado
          ctx.patchState({
            role: {
              data: [...state.role.data, newRole],
              total: state.role.total + 1
            }
          });
          
          this.notificationService.showSuccess(result?.message || 'Rol creado exitosamente');
        },
        error: err => {
          console.error('Error al crear rol:', err);
          this.notificationService.showError(err?.error?.message || 'Error al crear el rol');
          throw new Error(err?.error?.message);
        }
      })
    );
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
