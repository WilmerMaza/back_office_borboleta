import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { MenuModel } from '../interface/menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) {}

  getMenu(payload?: Params): Observable<MenuModel> {
    return this.http.get<MenuModel>(`${environment.URL}/menu.json`, { params: payload });
  }

}
