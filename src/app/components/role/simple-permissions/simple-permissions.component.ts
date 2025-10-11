import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { RoleState } from '../../../shared/store/state/role.state';
import { Observable } from 'rxjs';
import { Module } from '../../../shared/interface/role.interface';
import { GetRoleModules } from '../../../shared/store/action/role.action';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RolePermissionsService } from '../../../shared/services/role-permissions.service';

@Component({
  selector: 'app-simple-permissions',
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="row g-sm-4 g-2">
      <div class="col-xl-12">
        <div class="row roles-form">
          @for(module of modules$ | async; track module.id; let i = $index){
            <div class="col-12">
              <ul>
                <li>{{ module?.name.replace('_', ' ') | titlecase }} </li>
                <li>
                  <div class="form-check form-switch">
                    <input 
                      class="checkbox_animated form-check-input checkall" 
                      type="checkbox" 
                      id="role-{{module.id}}" 
                      [checked]="module.isChecked" 
                      (change)="checkUncheckAll($event, module)">
                    <label class="form-check-label m-0 form-label" for="role-{{module.id}}">
                      {{ 'all' | translate }}
                    </label>
                  </div>
                </li>

                @for(permission of module.module_permissions; track permission.id){
                  <li>
                    <div class="form-check form-switch">
                      <input 
                        class="checkbox_animated form-check-input check-it" 
                        [name]="permission.name" 
                        type="checkbox" 
                        id="{{ permission.id }}" 
                        [checked]="selectedPermissions.includes(permission.id)" 
                        [value]="permission.id" 
                        (change)="onPermissionChecked($event, permission)">
                      <label class="form-check-label m-0 form-label" for="{{ permission.id }}">
                        {{ permission.name | titlecase }}
                      </label>
                    </div>
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </div>

    <div class="row mt-3">
      <div class="col-12 text-end">
        <button 
          type="button" 
          class="btn btn-primary" 
          (click)="savePermissions()"
          [disabled]="loading">
          {{ loading ? 'Guardando...' : ('save_permissions' | translate) }}
        </button>
      </div>
    </div>
  `
})
export class SimplePermissionsComponent implements OnInit {

  @Input() roleId: number | null = null;
  @Output() permissionsSaved: EventEmitter<number[]> = new EventEmitter();

  modules$: Observable<Module[]> = inject(Store).select(RoleState.roleModules);
  selectedPermissions: number[] = [];
  loading: boolean = false;

  constructor(
    private store: Store,
    private rolePermissionsService: RolePermissionsService
  ) {
    this.store.dispatch(new GetRoleModules());
  }

  ngOnInit() {
    if (this.roleId) {
      this.loadCurrentPermissions();
    }
  }

  // Cargar permisos actuales del rol
  loadCurrentPermissions() {
    this.loading = true;
    this.rolePermissionsService.getRolePermissions(this.roleId!).subscribe({
      next: (response) => {
        console.log('Permisos actuales:', response);
        if (response.success && response.data) {
          this.selectedPermissions = response.data.map((p: any) => p.id);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.loading = false;
      }
    });
  }

  // Seleccionar/deseleccionar todos los permisos de un módulo
  checkUncheckAll(event: Event, module: Module) {
    const isChecked = (event.target as HTMLInputElement).checked;
    module.isChecked = isChecked;
    
    module.module_permissions.forEach(permission => {
      permission.isChecked = isChecked;
      this.togglePermission(permission.id, isChecked);
    });
  }

  // Seleccionar/deseleccionar un permiso específico
  onPermissionChecked(event: Event, permission: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    permission.isChecked = isChecked;
    this.togglePermission(permission.id, isChecked);
  }

  // Agregar o quitar permiso de la lista
  togglePermission(permissionId: number, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedPermissions.includes(permissionId)) {
        this.selectedPermissions.push(permissionId);
      }
    } else {
      this.selectedPermissions = this.selectedPermissions.filter(id => id !== permissionId);
    }
    
    console.log('Permisos seleccionados:', this.selectedPermissions);
  }

  // Guardar permisos en el backend
  savePermissions() {
    if (!this.roleId) return;
    
    this.loading = true;
    console.log('Guardando permisos:', this.selectedPermissions);
    
    this.rolePermissionsService.updatePermissions(this.roleId, this.selectedPermissions).subscribe({
      next: (response) => {
        console.log('Permisos guardados:', response);
        this.loading = false;
        this.permissionsSaved.emit(this.selectedPermissions);
        alert('Permisos guardados exitosamente');
      },
      error: (error) => {
        console.error('Error guardando permisos:', error);
        this.loading = false;
        alert('Error al guardar permisos');
      }
    });
  }
}

