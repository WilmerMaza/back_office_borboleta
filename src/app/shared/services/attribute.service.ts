import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
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
    return this.http.get<AttributeModel>(`assets/data/attribute.json`, {
      params: payload,
    });
  }

  getAttributeValues(payload?: Params): Observable<AttributeValueModel> {
    return this.http.get<AttributeValueModel>(
      `assets/data/attribute-value.json`,
      { params: payload }
    );
  }
}
