import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'app-dropdown-list',
    imports: [],
    templateUrl: './dropdown-list.component.html',
    styleUrl: './dropdown-list.component.scss'
})
export class DropdownListComponent implements OnInit {

  @Input() data: any;
  @Input() selectedPillIds: number[];
  @Input() parentId: number[];
  @Input() key: string;
  @Input() subArrayKey: string;
  @Input() showImage: boolean;
  
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() subItemClicked: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    console.log('=== DROPDOWN LIST DEBUG ===');
    console.log('DropdownList data:', this.data);
    console.log('DropdownList key:', this.key);
    console.log('DropdownList data[key]:', this.data?.[this.key]);
    console.log('DropdownList data.name:', this.data?.name);
    console.log('DropdownList data.id:', this.data?.id);
    console.log('DropdownList selectedPillIds:', this.selectedPillIds);
    console.log('DropdownList parentId:', this.parentId);
    console.log('=== FIN DROPDOWN LIST DEBUG ===');
  }
  

  select(data: any) {
    data.selected = !data.selected;
    this.selected.emit(data);
  }

  onArrowClick(event: Event, data: any) {
    event.stopPropagation();
    this.subItemClicked.emit(data);
  }
  
}
