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
          ctx.patchState({
            attribute: {
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
    // Create Attribute Logic Here
  }

  @Action(EditAttribute)
  edit(ctx: StateContext<AttributeStateModel>, { id }: EditAttribute) {
    return this.attributeService.getAttributes().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          const result = results.data.find(attribute => attribute.id == id);
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
    // Update Attribute Logic Here
  }

  @Action(UpdateAttributeStatus)
  updateStatus(ctx: StateContext<AttributeStateModel>, { id, status }: UpdateAttributeStatus) {
    // Update Attribute Status Logic Here
  }

  @Action(DeleteAttribute)
  delete(ctx: StateContext<AttributeStateModel>, { id }: DeleteAttribute) {
    // Delete Attribute Logic Here
  }

  @Action(DeleteAllAttribute)
  deleteAll(ctx: StateContext<AttributeStateModel>, { ids }: DeleteAllAttribute) {
    // Delete ALl Attribute Logic Here
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
