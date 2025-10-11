import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePermissionsService } from '../../../shared/services/role-permissions.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsComponent } from '../permissions/permissions.component';

@Component({
  selector: 'app-role-permissions',
  imports: [CommonModule, TranslateModule, PermissionsComponent],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>{{ 'assign_permissions' | translate }} - {{ roleName }}</h4>
            </div>
            <div class="card-body">
              <app-permissions 
                [selectedPermission]="selectedPermissions"
                (setPermissions)="onPermissionsChange($event)">
              </app-permissions>
              
              <div class="row mt-3">
                <div class="col-12 text-end">
                  <button 
                    type="button" 
                    class="btn btn-primary me-2" 
                    (click)="savePermissions()"
                    [disabled]="loading">
                    {{ loading ? 'Saving...' : ('save_permissions' | translate) }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    (click)="cancel()">
                    {{ 'cancel' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RolePermissionsComponent implements OnInit {
  
  roleId: number | null = null;
  roleName: string = '';
  selectedPermissions: number[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private rolePermissionsService: RolePermissionsService
  ) {}

  ngOnInit() {
    // Obtener el ID del rol de la URL
    this.roleId = +this.route.snapshot.paramMap.get('id')!;
    
    if (this.roleId) {
      this.loadRolePermissions();
    }
  }

  // Cargar permisos actuales del rol
  loadRolePermissions() {
    this.loading = true;
    this.rolePermissionsService.getRolePermissions(this.roleId!).subscribe({
      next: (response) => {
        console.log('Permisos del rol:', response);
        
        // Extraer los IDs de permisos de la respuesta
        if (response.success && response.data) {
          this.selectedPermissions = response.data.map((p: any) => p.id);
          this.roleName = response.role_name || 'Rol';
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando permisos:', error);
        this.loading = false;
      }
    });
  }

  // Cuando cambian los permisos seleccionados
  onPermissionsChange(permissionIds: number[]) {
    console.log('Permisos seleccionados:', permissionIds);
    this.selectedPermissions = permissionIds;
  }

  // Guardar permisos en el backend
  savePermissions() {
    if (!this.roleId) return;
    
    this.loading = true;
    console.log('Guardando permisos:', this.selectedPermissions);
    
    this.rolePermissionsService.updatePermissions(this.roleId, this.selectedPermissions).subscribe({
      next: (response) => {
        console.log('Permisos guardados exitosamente:', response);
        this.loading = false;
        // Aquí puedes mostrar una notificación de éxito
        alert('Permisos guardados exitosamente');
      },
      error: (error) => {
        console.error('Error guardando permisos:', error);
        this.loading = false;
        // Aquí puedes mostrar una notificación de error
        alert('Error al guardar permisos');
      }
    });
  }

  cancel() {
    // Volver a la lista de roles
    window.history.back();
  }
}

