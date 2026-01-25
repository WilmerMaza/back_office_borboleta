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
    const url = `${environment.URL}/taxes`;
    console.log('🌐 [TAX SERVICE] getTaxes - URL:', url);
    console.log('🌐 [TAX SERVICE] getTaxes - Params:', payload);
    return this.http.get<TaxModel>(url, { params: payload });
  }

  getTaxById(id: number): Observable<Tax> {
    const url = `${environment.URL}/taxes/${id}`;
    console.log('🌐 [TAX SERVICE] getTaxById - URL:', url);
    return this.http.get<Tax>(url);
  }

  createTax(tax: Tax): Observable<Tax> {
    const url = `${environment.URL}/taxes`;
    console.log('🌐 [TAX SERVICE] createTax - URL:', url);
    console.log('🌐 [TAX SERVICE] createTax - Body:', tax);
    return this.http.post<Tax>(url, tax);
  }

  updateTax(tax: Tax, id: number): Observable<Tax> {
    const url = `${environment.URL}/taxes/${id}`;
    console.log('🌐 [TAX SERVICE] updateTax - URL:', url);
    console.log('🌐 [TAX SERVICE] updateTax - Body:', tax);
    return this.http.put<Tax>(url, tax);
  }

  updateTaxStatus(id: number, status: boolean): Observable<Tax> {
    const url = `${environment.URL}/taxes/${id}/status`;
    console.log('🌐 [TAX SERVICE] updateTaxStatus - URL:', url);
    console.log('🌐 [TAX SERVICE] updateTaxStatus - Body:', { status });
    return this.http.put<Tax>(url, { status });
  }

  deleteTax(id: number): Observable<any> {
    const url = `${environment.URL}/taxes/${id}`;
    console.log('🌐 [TAX SERVICE] deleteTax - URL:', url);
    return this.http.delete(url);
  }

  deleteMultipleTaxes(ids: number[]): Observable<any> {
    const url = `${environment.URL}/taxes/delete-multiple`;
    console.log('🌐 [TAX SERVICE] deleteMultipleTaxes - URL:', url);
    console.log('🌐 [TAX SERVICE] deleteMultipleTaxes - Body:', { ids });
    return this.http.post(url, { ids });
  }
}
