import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Menu, MenuModel } from '../interface/menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) {}

  getMenu(payload?: Params): Observable<MenuModel> {
    return this.http.get<MenuModel>(`${environment.URL}/menus`, {
      params: payload,
    });
  }

  getMenuHierarchy(): Observable<MenuModel> {
    return this.http.get<MenuModel>(`${environment.URL}/menus/hierarchy`);
  }

  getMenuById(id: number): Observable<Menu> {
    return this.http.get<Menu>(`${environment.URL}/menus/${id}`);
  }

  createMenu(menu: Menu): Observable<Menu> {
    return this.http.post<Menu>(`${environment.URL}/menus`, menu);
  }

  updateMenu(menu: Menu, id: number): Observable<Menu> {
    return this.http.put<Menu>(`${environment.URL}/menus/${id}`, menu);
  }

  updateMenuSort(payload: any): Observable<any> {
    return this.http.put(`${environment.URL}/menus/sort`, payload);
  }

  deleteMenu(id: number): Observable<any> {
    return this.http.delete(`${environment.URL}/menus/${id}`);
  }

}
