import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { AttachmentModel } from "../interface/attachment.interface";
import { Params } from "../interface/core.interface";

@Injectable({
  providedIn: "root",
})
export class AttachmentService {

  constructor(private http: HttpClient) {}

  getAttachments(payload?: Params): Observable<AttachmentModel> {
    // Usar el endpoint real para obtener archivos existentes
    return this.http.get<AttachmentModel>(`${environment.URL}/attachments`, {
      params: payload,
    });
  }

  createAttachment(files: File[]): Observable<any> {
    // Usar el endpoint de upload para subir archivos
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files[]', file);
    });
    
    // Usar el endpoint de upload que ya existe
    return this.http.post(`${environment.URL}/attachments/upload/files`, formData);
  }

  deleteAttachment(id: number): Observable<any> {
    // Usar el endpoint de upload para eliminar archivos
    return this.http.delete(`${environment.URL}/upload/${id}`);
  }

  deleteAllAttachments(ids: number[]): Observable<any> {
    // Eliminar archivos uno por uno usando el endpoint de upload
    const deletePromises = ids.map(id => 
      this.http.delete(`${environment.URL}/upload/${id}`).toPromise()
    );
    
    return new Observable(observer => {
      Promise.all(deletePromises).then(() => {
        observer.next({ success: true });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

}
