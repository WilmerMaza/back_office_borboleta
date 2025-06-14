import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { ThemesModel } from '../interface/theme.interface';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private http: HttpClient) { }

  getThemes(): Observable<ThemesModel> {
    return this.http.get<ThemesModel>(`assets/data/theme.json`);
  }

  getHomePage(payload?: Params): Observable<any> {
    return this.http.get(`assets/data/home/${payload!["slug"]}.json`);
  }
  
}
