import { DatePipe } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalDismissReasons, NgbDateStruct, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { UpdateOrderStatus } from '../../../../shared/store/action/order.action';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
    selector: 'app-shipping-note-modal',
    imports: [TranslateModule, FormsModule, ReactiveFormsModule,
        ButtonComponent
    ],
    templateUrl: './shipping-note-modal.component.html',
    styleUrl: './shipping-note-modal.component.scss'
})
export class ShippingNoteModalComponent {

  public closeResult: string;
  public modalOpen: boolean = false;
  public orderId: number;
  public statusId: number;
  public date = new FormControl();


  @ViewChild("noteModal") NoteModal: TemplateRef<string>;

  constructor(private modalService: NgbModal, private datePipe: DatePipe,
    private store: Store) {
  }

  async openModal(id: number, value: number) {
    this.modalOpen = true;
    this.orderId = id;
    this.statusId = value;
    this.date.patchValue('');
    this.modalService.open(this.NoteModal, {
      ariaLabelledBy: 'Note-Modal',
      centered: true,
      backdrop: 'static',
      keyboard: false,
      windowClass: 'theme-modal'
    }).result.then((result) => {
      `Result ${result}`
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: ModalDismissReasons): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
	model: NgbDateStruct;
  submit(modal: NgbModalRef, value: string) {
    let dateToUse: Date;
    
    // Si el usuario seleccionó una fecha, usarla; si no, usar la fecha actual
    if (this.date.value) {
      dateToUse = new Date(this.date.value);
    } else {
      dateToUse = new Date();
    }
    
    // Convertir a formato compatible con Laravel/PHP (yyyy-MM-ddTHH:mm:ss)
    // Algunos backends no aceptan la Z final o los milisegundos
    const changedAt = this.datePipe.transform(dateToUse, 'yyyy-MM-ddTHH:mm:ss') || dateToUse.toISOString().slice(0, 19);
    
    this.store.dispatch(new UpdateOrderStatus(this?.orderId, { 
      order_status_id: Number(this.statusId), 
      note: value, 
      changed_at: changedAt
    })).subscribe({
      complete: () => {
        modal.dismiss();
      }
    });
  }

  ngOnDestroy() {
    if (this.modalOpen) {
      this.modalService.dismissAll();
    }
  }

}
