import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { RevenueChart, StatisticsCount } from "../interface/dashboard.interface";

@Injectable({
  providedIn: "root",
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  getStatisticsCount(payload?: Params): Observable<StatisticsCount> {
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<StatisticsCount>(`${environment.URL}/statistics`, {
      headers: headers,
      params: payload
    });
  }

  getRevenueChart(): Observable<RevenueChart> {
    return this.http.get<RevenueChart>(`assets/data/chart.json`);
  }

  // Método privado para obtener el token del localStorage
  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

}
