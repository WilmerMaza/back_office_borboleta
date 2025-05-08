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
    return this.http.get<AttachmentModel>(`${environment.URL}/attachment.json`, { params: payload });
  }

}
