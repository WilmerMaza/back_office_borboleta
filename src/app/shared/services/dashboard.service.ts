import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Params } from "../interface/core.interface";
import { RevenueChart, StatisticsCount } from "../interface/dashboard.interface";
import {
  normalizeRevenueChartResponse,
  normalizeStatisticsResponse,
} from "../utils/dashboard-api-normalize";

@Injectable({
  providedIn: "root",
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  getStatisticsCount(payload?: Params): Observable<StatisticsCount> {
    // El AuthInterceptor se encarga automáticamente de agregar el token de autenticación
    return this.http.get<unknown>(`${environment.URL}/statistics`, { params: payload }).pipe(
      map((raw) => normalizeStatisticsResponse(raw))
    );
  }

  getRevenueChart(payload?: Params): Observable<RevenueChart> {
    return this.http
      .get<unknown>(`${environment.URL}/statistics/revenue-chart`, { params: payload })
      .pipe(map((raw) => normalizeRevenueChartResponse(raw)));
  }

}
