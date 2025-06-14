import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from '../../../environments/environment.development';
import { Params } from "../interface/core.interface";
import { Badges } from "../interface/sidebar.interface";

@Injectable({
  providedIn: "root",
})
export class NavService {

  // Search Box
  public search: boolean = false;

  public collapseSidebar: boolean = false;
  public sidebarLoading: boolean = false;
  public fullScreen: boolean = false;


  constructor(private http: HttpClient) { }

  getBadges(payload?: Params): Observable<Badges> {
    return this.http.get<Badges>(`assets/data/badge.json`, payload);
  }

}
