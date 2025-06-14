import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { Point } from "../interface/point.interface";

@Injectable({
  providedIn: "root",
})
export class PointService {

  constructor(private http: HttpClient) {}

  getUserTransaction(payload?: Params): Observable<Point> {
    return this.http.get<Point>(`assets/data/points.json`, { params: payload });
  }

}
