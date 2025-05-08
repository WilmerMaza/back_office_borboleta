import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { PageModel } from "../interface/page.interface";

@Injectable({
  providedIn: "root",
})
export class PageService {

  constructor(private http: HttpClient) {}

  getPages(payload?: Params): Observable<PageModel> {
    return this.http.get<PageModel>(`${environment.URL}/page.json`, { params: payload });
  }
}
