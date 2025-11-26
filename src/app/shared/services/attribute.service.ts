import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import {
  Attribute,
  AttributeModel,
  AttributeValueModel,
} from "../interface/attribute.interface";
import { Params } from "../interface/core.interface";

@Injectable({
  providedIn: "root",
})
export class AttributeService {
  constructor(private http: HttpClient) {}

  getAttributes(payload?: Params): Observable<AttributeModel> {
    return this.http.get<AttributeModel>(`${environment.URL}/attributes`, {
      params: payload,
    });
  }

  getAttributeValues(payload?: Params): Observable<AttributeValueModel> {
    return this.http.get<AttributeValueModel>(`${environment.URL}/attribute-values`, {
      params: payload
    });
  }

  createAttribute(attribute: any): Observable<any> {
    return this.http.post(`${environment.URL}/attributes`, attribute);
  }

  updateAttribute(attribute: any, id: number): Observable<any> {
    return this.http.put(`${environment.URL}/attributes/${id}`, attribute);
  }

  updateAttributeStatus(id: number, status: boolean): Observable<any> {
    return this.http.patch(`${environment.URL}/attributes/${id}/status`, { status });
  }

  deleteAttribute(id: number): Observable<any> {
    return this.http.delete(`${environment.URL}/attributes/${id}`);
  }

  deleteMultipleAttributes(ids: number[]): Observable<any> {
    return this.http.post(`${environment.URL}/attributes/delete-multiple`, { ids });
  }
}
