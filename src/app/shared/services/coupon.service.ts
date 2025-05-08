import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { CouponModel } from "../interface/coupon.interface";

@Injectable({
  providedIn: "root",
})
export class CouponService {

  constructor(private http: HttpClient) {}

  getCoupons(payload?: Params): Observable<CouponModel> {
    return this.http.get<CouponModel>(`${environment.URL}/coupon.json`, { params: payload });
  }
 
}
