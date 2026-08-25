import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { Tax, TaxModel } from "../interface/tax.interface";

@Injectable({
  providedIn: "root",
})
export class TaxService {

  constructor(private http: HttpClient) {}

  getTaxes(payload?: Params): Observable<TaxModel> {
    return this.http.get<TaxModel>(`${environment.URL}/taxes`, { params: payload });
  }

  getTaxById(id: number): Observable<Tax> {
    return this.http.get<Tax>(`${environment.URL}/taxes/${id}`);
  }

  createTax(tax: Tax): Observable<Tax> {
    return this.http.post<Tax>(`${environment.URL}/taxes`, tax);
  }

  updateTax(tax: Tax, id: number): Observable<Tax> {
    return this.http.put<Tax>(`${environment.URL}/taxes/${id}`, tax);
  }

  updateTaxStatus(id: number, status: boolean): Observable<Tax> {
    return this.http.put<Tax>(`${environment.URL}/taxes/${id}/status`, { status });
  }

  deleteTax(id: number): Observable<any> {
    return this.http.delete(`${environment.URL}/taxes/${id}`);
  }

  deleteMultipleTaxes(ids: number[]): Observable<any> {
    return this.http.post(`${environment.URL}/taxes/delete-multiple`, { ids });
  }
}
