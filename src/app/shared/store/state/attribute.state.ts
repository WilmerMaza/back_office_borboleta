import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { tap } from "rxjs";
import { GetAttributes, GetAttributeValues, CreateAttribute, EditAttribute, 
         UpdateAttribute, UpdateAttributeStatus, DeleteAttribute, 
         DeleteAllAttribute, ExportAttribute, ImportAtribute } from "../action/attribute.action";
import { Attribute, AttributeValue } from "../../interface/attribute.interface";
import { AttributeService } from "../../services/attribute.service";
import { NotificationService } from "../../services/notification.service";
import { ImportTag } from "../action/tag.action";

export class AttributeStateModel {
  attribute = {
    data: [] as Attribute[],
    total: 0
  }
  attribute_values: AttributeValue[];
  selectedAttribute: Attribute | null;
}

@State<AttributeStateModel>({
  name: "attribute",
  defaults: {
    attribute: {
      data: [],
      total: 0
    },
    attribute_values: [],
    selectedAttribute: null
  },
})
@Injectable()
export class AttributeState {
  
  constructor(private store: Store,
    private notificationService: NotificationService,
    private attributeService: AttributeService) {}

  @Selector()
  static attribute(state: AttributeStateModel) {
    return state.attribute;
  }

  @Selector()
  static attributes(state: AttributeStateModel) {
    return (ids: string) => {
      let attrIds =  Array.from(new Set(ids.split(','))).map(Number);
      let filter = attrIds.length ? state.attribute.data.filter(attr => !attrIds.includes(Number(attr.id!))) : state.attribute.data;
      return filter.map((attribute: Attribute) => {
        return { label: attribute?.name, value: attribute?.id, attribute_values: attribute?.attribute_values }
      });
    };
  }

  @Selector()
  static attribute_value(state: AttributeStateModel) {
    return (id: number | null) => {
      if(!id) return [];
      return state?.attribute_values.filter(attr_val => +attr_val.attribute_id === id)?.map((value: AttributeValue) => {
        return { label: value?.value, value: value?.id }
      });
    };
  }

  @Selector()
  static selectedAttribute(state: AttributeStateModel) {
    return state.selectedAttribute;
  }

  @Action(GetAttributes)
  getAttributes(ctx: StateContext<AttributeStateModel>, action: GetAttributes) {
    return this.attributeService.getAttributes(action.payload).pipe(
      tap({
        next: result => {
          let attributes: Attribute[] = [];
          let total = 0;
          
          if (result?.data) {
            if (Array.isArray(result.data)) {
              attributes = result.data;
              total = result.total || attributes.length;
            } else {
              attributes = result.data;
              total = result.total || 0;
            }
          }
          
          ctx.patchState({
            attribute: {
              data: attributes,
              total: total
            }
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(GetAttributeValues)
  getAttributeValues(ctx: StateContext<AttributeStateModel>, action: GetAttributeValues) {
    return this.attributeService.getAttributeValues(action.payload).pipe(
      tap({
        next: result => { 
          const state = ctx.getState();
          ctx.patchState({
            ...state,
            attribute_values: result.data
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(CreateAttribute)
  create(ctx: StateContext<AttributeStateModel>, action: CreateAttribute) {
    return this.attributeService.createAttribute(action.payload).pipe(
      tap({
        next: (result: any) => {
          // Extraer el atributo de la respuesta del backend
          const newAttribute = result?.data?.attribute || result?.data || result;
          
          const state = ctx.getState();
          ctx.setState({
            ...state,
            attribute: {
              data: [...state.attribute.data, newAttribute],
              total: state.attribute.total + 1
            }
          });
          
          this.notificationService.showSuccess(result?.message || 'Atributo creado exitosamente');
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al crear el atributo');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(EditAttribute)
  edit(ctx: StateContext<AttributeStateModel>, { id }: EditAttribute) {
    const state = ctx.getState();
    
    // Primero intentar obtener del estado local
    const localAttribute = state.attribute.data.find(attribute => attribute.id == id);
    
    if (localAttribute) {
      ctx.patchState({
        ...state,
        selectedAttribute: localAttribute
      });
      return;
    }
    
    // Si no está en el estado local, buscar todos los atributos
    return this.attributeService.getAttributes().pipe(
      tap({
        next: results => {
          let attributes: Attribute[] = [];
          if (Array.isArray(results.data)) {
            attributes = results.data;
          }
          
          const result = attributes.find(attribute => attribute.id == id);
          
          ctx.patchState({
            ...state,
            selectedAttribute: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateAttribute)
  update(ctx: StateContext<AttributeStateModel>, { payload, id }: UpdateAttribute) {
    return this.attributeService.updateAttribute(payload, id).pipe(
      tap({
        next: (result: any) => {
          // Extraer el atributo actualizado de la respuesta del backend
          const updatedAttribute = result?.data?.attribute || result?.data || result;
          
          const state = ctx.getState();
          const updatedData = state.attribute.data.map(attribute => 
            attribute.id === id ? updatedAttribute : attribute
          );
          
          ctx.setState({
            ...state,
            attribute: {
              data: updatedData,
              total: state.attribute.total
            },
            selectedAttribute: updatedAttribute
          });
          
          this.notificationService.showSuccess(result?.message || 'Atributo actualizado exitosamente');
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el atributo');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateAttributeStatus)
  updateStatus(ctx: StateContext<AttributeStateModel>, { id, status }: UpdateAttributeStatus) {
    return this.attributeService.updateAttributeStatus(id, status).pipe(
      tap({
        next: (result: any) => {
          const state = ctx.getState();
          const updatedData = state.attribute.data.map(attribute => 
            attribute.id === id ? { ...attribute, status } : attribute
          );
          
          ctx.setState({
            ...state,
            attribute: {
              data: updatedData,
              total: state.attribute.total
            }
          });
          
          this.notificationService.showSuccess(result?.message || 'Estado actualizado exitosamente');
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al actualizar el estado');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteAttribute)
  delete(ctx: StateContext<AttributeStateModel>, { id }: DeleteAttribute) {
    return this.attributeService.deleteAttribute(id).pipe(
      tap({
        next: (result: any) => {
          const state = ctx.getState();
          const filteredData = state.attribute.data.filter(attribute => attribute.id !== id);
          
          ctx.setState({
            ...state,
            attribute: {
              data: filteredData,
              total: state.attribute.total - 1
            },
            selectedAttribute: null
          });
          
          this.notificationService.showSuccess(result?.message || 'Atributo eliminado exitosamente');
        },
        error: err => {
          this.notificationService.showError(err?.error?.message || 'Error al eliminar el atributo');
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(DeleteAllAttribute)
  deleteAll(ctx: StateContext<AttributeStateModel>, { ids }: DeleteAllAttribute) {
    return this.attributeService.deleteMultipleAttributes(ids).pipe(
      tap({
        next: (result: any) => {
          const state = ctx.getState();
          const filteredData = state.attribute.data.filter(
            attribute => !ids.includes(attribute.id!)
          );
          
          ctx.setState({
            ...state,
            attribute: {
              data: filteredData,
              total: state.attribute.total - ids.length
            }
          });
          
          const deletedCount = result?.data?.deleted || ids.length;
          this.notificationService.showSuccess(
            result?.message || `${deletedCount} atributos eliminados exitosamente`
          );
        },
        error: err => {
          this.notificationService.showError(
            err?.error?.message || 'Error al eliminar los atributos'
          );
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(ImportAtribute)
  import(ctx: StateContext<AttributeStateModel>, action: ImportTag) {
    // Import Attribute Logic Here 
  }

  @Action(ExportAttribute)
  export(ctx: StateContext<AttributeStateModel>, action: ExportAttribute) {
    // Export Attribute Logic Here 
  }

}
