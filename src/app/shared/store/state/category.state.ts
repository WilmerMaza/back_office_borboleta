import { Injectable } from "@angular/core";
import { Store, Action, Selector, State, StateContext } from "@ngxs/store";
import { Router } from '@angular/router';
import { tap } from "rxjs";
import { GetCategories, CreateCategory, EditCategory, 
         UpdateCategory, DeleteCategory, ExportCategory, ImportCategory } from "../action/category.action";
import { Category } from "../../interface/category.interface";
import { CategoryService } from "../../services/category.service";
import { NotificationService } from "../../services/notification.service";

export class CategoryStateModel {
  category = {
    data: [] as Category[],
    total: 0
  }
  selectedCategory: Category | null;
}

@State<CategoryStateModel>({
  name: "category",
  defaults: {
    category: {
      data: [],
      total: 0
    },
    selectedCategory: null
  },
})
@Injectable()
export class CategoryState {
  
  constructor(private store: Store, private router: Router,
    private notificationService: NotificationService,
    private categoryService: CategoryService) {}

  @Selector()
  static category(state: CategoryStateModel) {
    return state.category;
  }


  @Selector()
  static categories(state: CategoryStateModel) {
    return state.category.data.map(res => { 
      return { 
        label: res?.name || 'Sin nombre', 
        name: res?.name || 'Sin nombre',
        value: res?.id || 0, 
        data: { 
          name: res?.name ,
          slug: res?.slug || '',
          image: res?.category_icon ? res?.category_icon.original_url : 'assets/images/category.png' 
        }
      }
    });
  }

  @Selector()
  static categoriesSlug(state: CategoryStateModel) {
    return state.category.data.map(res => { 
      return { label: res?.name, value: res?.slug, data: { 
        name: res.name,
        slug: res.slug,
        image: res.category_icon ? res.category_icon.original_url : 'assets/images/category.png' 
      }}
    });
  }


  @Selector()
  static selectedCategory(state: CategoryStateModel) {
    return state.selectedCategory;
  }

  @Action(GetCategories)
  getCategories(ctx: StateContext<CategoryStateModel>, action: GetCategories) {
    return this.categoryService.getCategories(action.payload).pipe(
      tap({
        next: result => {
          console.log('📦 Respuesta del backend - Categorías:', result);
          
          // Procesar la respuesta según la estructura del backend
          let categories: Category[] = [];
          let total = 0;
          
          if (result?.data) {
            const dataObj = result.data as any;
            
            // Si viene en result.data.categories (objeto con array de categorías)
            if (dataObj.categories && Array.isArray(dataObj.categories)) {
              categories = dataObj.categories;
              total = dataObj.total || dataObj.pagination?.total || categories.length;
            }
            // Si viene directamente en result.data como array
            else if (Array.isArray(result.data)) {
              categories = result.data;
              total = result.total || categories.length;
            }
            // Otro formato (objeto)
            else {
              categories = result.data || [];
              total = result.total || 0;
            }
          }
          
          console.log('✅ Categorías procesadas:', categories.length);
          console.log('📊 Estructura de primera categoría:', categories[0]);
          
          ctx.patchState({
            category: {
              data: categories,
              total: total
            }
          });
        },
        error: err => { 
          console.error('Error loading categories:', err);
        }
      })
    );
  }

  @Action(CreateCategory)
  create(ctx: StateContext<CategoryStateModel>, action: CreateCategory) {
    return this.categoryService.createCategory(action.payload).pipe(
      tap((response: Category) => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          category: {
            data: [...state.category.data, response],
            total: state.category.total + 1
          }
        });
        this.notificationService.showSuccess('Categoría creada exitosamente');
      })
    );
  }

  @Action(EditCategory)
  edit(ctx: StateContext<CategoryStateModel>, { id }: EditCategory) {
    return this.categoryService.getCategories().pipe(
      tap({
        next: results => { 
          const state = ctx.getState();
          
          // Obtener el array de categorías según la estructura del backend
          let categories: Category[] = [];
          const dataObj = results.data as any;
          
          if (dataObj.categories && Array.isArray(dataObj.categories)) {
            categories = dataObj.categories;
          } else if (Array.isArray(results.data)) {
            categories = results.data;
          }
          
          const result = categories.find(category => category.id == id);
          ctx.patchState({
            ...state,
            selectedCategory: result
          });
        },
        error: err => { 
          throw new Error(err?.error?.message);
        }
      })
    );
  }

  @Action(UpdateCategory)
  update(ctx: StateContext<CategoryStateModel>, action: UpdateCategory) {
    return this.categoryService.updateCategory(action.payload, action.id).pipe(
      tap((response: Category) => {
        const state = ctx.getState();
        const updatedData = state.category.data.map(category => 
          category.id === action.id ? response : category
        );
        
        ctx.setState({
          ...state,
          category: {
            data: updatedData,
            total: state.category.total
          },
          selectedCategory: response
        });
        
        this.notificationService.showSuccess('Categoría actualizada exitosamente');
      })
    );
  }

  @Action(DeleteCategory)
  delete(ctx: StateContext<CategoryStateModel>, action: DeleteCategory) {
    return this.categoryService.deleteCategory(action.id).pipe(
      tap(() => {
        const state = ctx.getState();
        const filteredData = state.category.data.filter(category => category.id !== action.id);
        
        ctx.setState({
          ...state,
          category: {
            data: filteredData,
            total: state.category.total - 1
          },
          selectedCategory: null
        });
        
        this.notificationService.showSuccess('Categoría eliminada exitosamente');
      })
    );
  }

  @Action(ImportCategory)
  import(ctx: StateContext<CategoryStateModel>, action: ImportCategory) {
    // Import Category Logic Here
  }

  @Action(ExportCategory)
  export(ctx: StateContext<CategoryStateModel>, action: ExportCategory) {
    // Export Category Logic Here
  }

}
