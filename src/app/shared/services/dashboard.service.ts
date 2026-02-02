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
    // El AuthInterceptor se encarga automáticamente de agregar el token de autenticación
    // No es necesario manejar el token manualmente aquí
    return this.http.get<StatisticsCount>(`${environment.URL}/statistics`, {
      params: payload
    });
  }

  getRevenueChart(): Observable<RevenueChart> {
    return this.http.get<RevenueChart>(`assets/data/chart.json`);
  }

}
