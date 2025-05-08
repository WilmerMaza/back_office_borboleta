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
    return this.http.get<StatisticsCount>(`${environment.URL}/count.json`, { params: payload });
  }

  getRevenueChart(): Observable<RevenueChart> {
    return this.http.get<RevenueChart>(`${environment.URL}/chart.json`);
  }

}
