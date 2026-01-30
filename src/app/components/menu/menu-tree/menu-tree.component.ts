import { ButtonComponent } from './../../../shared/components/ui/button/button.component';
import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataComponent } from '../../../shared/components/ui/no-data/no-data.component';
import { Category } from '../../../shared/interface/category.interface';
import { Menu } from '../../../shared/interface/menu.interface';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { DeleteMenu, UpdateSortMenu } from '../../../shared/store/action/menu.action';
import { DeleteModalComponent } from '../../../shared/components/ui/modal/delete-modal/delete-modal.component';
import { HasPermissionDirective } from '../../../shared/directive/has-permission.directive';

@Component({
    selector: 'app-menu-tree',
    imports: [CommonModule, NoDataComponent, TranslateModule,
        FormsModule, ReactiveFormsModule, DragDropModule,
        RouterModule, DeleteModalComponent, HasPermissionDirective,
        ButtonComponent],
    templateUrl: './menu-tree.component.html',
    styleUrl: './menu-tree.component.scss'
})
export class MenuTreeComponent {

  @ViewChild("deleteModal") DeleteModal: DeleteModalComponent;

  @Input() type: string;
  private _data: Menu[] = [];
  @Input() 
  set data(value: Menu[]) {
    this._data = value || [];
    this.updateDataToShow();
  }
  get data(): Menu[] {
    return this._data;
  }
  @Input() recursionKey: string;
  @Input() displayKey: string = 'title';
  @Input() categoryType: string | null = 'product';

  public treeSearch = new FormControl('');
  public dataToShow: Menu[] = [];
  public showChildrenNode: boolean = true;
  public id: number;

  constructor(private store: Store, private router: Router,
    private route: ActivatedRoute) {
      
    this.treeSearch.valueChanges
        .subscribe(
          (searchValue) => {
            this.applySearchFilter(searchValue || '');
        });
  }


  ngOnInit(){
    
    this.route.params.subscribe( params => this.id = params['id']);
  }

  onShowChildrenNode(node: Menu){
    node['show'] = !node['show']
  }

  delete(actionType: string, data: Category) {
    this.store.dispatch(new DeleteMenu(data.id!)).subscribe({
      complete: () => {
        this.router.navigateByUrl('/menu');
      }
    });
  }

  ngOnChanges() {
    // Este método se mantiene por compatibilidad, pero el setter de data ya maneja la actualización
    this.updateDataToShow();
  }

  private updateDataToShow() {
    this.dataToShow = this.data || [];
    if (this.dataToShow && this.dataToShow.length > 0) {
      this.addKey(this.dataToShow);
    }
    // Si hay un valor de búsqueda activo, aplicar el filtro
    if (this.treeSearch?.value) {
      this.applySearchFilter(this.treeSearch.value);
    }
  }

  private applySearchFilter(searchValue: string) {
    if (!searchValue) {
      this.dataToShow = this.data || [];
      return;
    }
    
    this.dataToShow = [];
    if (this.data && Array.isArray(this.data)) {
      this.data.forEach(item => {
        if (item && this.hasValue(item)) {
          this.dataToShow.push(item);
        }
      });
    }
  }

  addKey(data: Menu[] | undefined | null){
    // Validar que data exista y sea un array antes de iterar
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }
    
    data.forEach(item => {
      if (item) {
        item['show'] = true;
        // Solo llamar recursivamente si child existe y es un array
        if (item.child && Array.isArray(item.child) && item.child.length > 0) {
          this.addKey(item.child);
        }
      }
    });
  }

  hasValue(item: any) {
    if (!item) return false;
    
    let valueToReturn = false;
    const displayValue = item[this.displayKey];
    const searchValue = this.treeSearch?.value?.toLowerCase();
    
    if (displayValue && searchValue && displayValue.toLowerCase().includes(searchValue)){
      valueToReturn = true;
    }
    
    // Validar que recursionKey exista y sea un array antes de iterar
    const recursionData = item[this.recursionKey];
    if (recursionData && Array.isArray(recursionData) && recursionData.length > 0) {
      recursionData.forEach((child: Category) => {
        if (child && this.hasValue(child)) {
          valueToReturn = true;
        }
      });
    }
    return valueToReturn;
  }
  
  drop(event: CdkDragDrop<any[]>, items: any[]) {
     if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex);
      this.updateShortNumbers(items);
    }
  }

  updateShortNumbers(items: any[]) {
    if (!items || !Array.isArray(items)) {
      return;
    }
    
    items.forEach((item, index) => {
      if (item) {
        item.sort = index;
        if (item.child && Array.isArray(item.child) && item.child.length > 0) {
          this.updateShortNumbers(item.child);
        }
      }
    });
  }

  saveChanges(){
    this.filterJson(this.dataToShow)
    this.store.dispatch(new UpdateSortMenu({menus: this.filterJson(this.dataToShow)}))
  }

  filterJson(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        item['sort'] = index
        return this.filterJson(item)
      });
    } else if (typeof obj === 'object') {
      const newObj: any = {};
      newObj['id'] = obj['id'];
      newObj['parent_id'] = obj['parent_id'];
      newObj['sort'] = obj['sort'];
      if (Array.isArray(obj['child'])) {
        newObj['child'] = this.filterJson(obj['child']);
      }
      return newObj;
    } else {
      return obj;
    }
  }

}
