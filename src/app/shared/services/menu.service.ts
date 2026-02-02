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
    const url = `${environment.URL}/menus`;
    console.log('🌐 [MENU SERVICE] getMenu - URL:', url);
    console.log('🌐 [MENU SERVICE] getMenu - Params:', payload);
    return this.http.get<MenuModel>(url, {
      params: payload,
    });
  }

  getMenuHierarchy(): Observable<MenuModel> {
    const url = `${environment.URL}/menus/hierarchy`;
    console.log('🌐 [MENU SERVICE] getMenuHierarchy - URL:', url);
    return this.http.get<MenuModel>(url);
  }

  getMenuById(id: number): Observable<Menu> {
    const url = `${environment.URL}/menus/${id}`;
    console.log('🌐 [MENU SERVICE] getMenuById - URL:', url);
    return this.http.get<Menu>(url);
  }

  createMenu(menu: Menu): Observable<Menu> {
    const url = `${environment.URL}/menus`;
    console.log('🌐 [MENU SERVICE] createMenu - URL:', url);
    console.log('🌐 [MENU SERVICE] createMenu - Body:', menu);
    return this.http.post<Menu>(url, menu);
  }

  updateMenu(menu: Menu, id: number): Observable<Menu> {
    const url = `${environment.URL}/menus/${id}`;
    console.log('🌐 [MENU SERVICE] updateMenu - URL:', url);
    console.log('🌐 [MENU SERVICE] updateMenu - Body:', menu);
    return this.http.put<Menu>(url, menu);
  }

  updateMenuSort(payload: any): Observable<any> {
    const url = `${environment.URL}/menus/sort`;
    console.log('🌐 [MENU SERVICE] updateMenuSort - URL:', url);
    console.log('🌐 [MENU SERVICE] updateMenuSort - Body:', payload);
    return this.http.put(url, payload);
  }

  deleteMenu(id: number): Observable<any> {
    const url = `${environment.URL}/menus/${id}`;
    console.log('🌐 [MENU SERVICE] deleteMenu - URL:', url);
    return this.http.delete(url);
  }

}
