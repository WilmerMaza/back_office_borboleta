import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { TaxModel } from "../interface/tax.interface";

@Injectable({
  providedIn: "root",
})
export class TaxService {

  constructor(private http: HttpClient) {}

  getTaxes(payload?: Params): Observable<TaxModel> {
    return this.http.get<TaxModel>(`${environment.URL}/tax.json`, { params: payload });
  }
}
