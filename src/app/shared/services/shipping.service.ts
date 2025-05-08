import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { Shipping } from "../interface/shipping.interface";

@Injectable({
  providedIn: "root",
})
export class ShippingService {

  constructor(private http: HttpClient) {}

  getShippings(payload?: Params): Observable<Shipping[]> {
    return this.http.get<Shipping[]>(`${environment.URL}/shipping.json`, { params: payload });
  }
  
}
