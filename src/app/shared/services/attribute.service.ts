import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { AttributeModel, AttributeValueModel } from "../interface/attribute.interface";
import { Params } from "../interface/core.interface";

@Injectable({
  providedIn: "root",
})
export class AttributeService {

  constructor(private http: HttpClient) {}

  getAttributes(payload?: Params): Observable<AttributeModel> {
    return this.http.get<AttributeModel>(`${environment.URL}/attribute.json`, { params: payload });
  }

  getAttributeValues(payload?: Params): Observable<AttributeValueModel> {
    return this.http.get<AttributeValueModel>(`${environment.URL}/attribute-value.json`, { params: payload });
  }
}
