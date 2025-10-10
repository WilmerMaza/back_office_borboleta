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


  getHomePage(slug?: string): Observable<any> {
  
    return this.http.get(`${environment.URL}/setting-theme/${slug}`);
  }

  // PUT /api/setting-theme/{slug} - Actualizar configuración de tema
  updateHomePage(pageId: number, payload: any): Observable<any> {
    // Extraer slug y content del payload
    const slug = payload.slug || 'fashion_one';
    const content = payload.content;
    
    // Estructura correcta que espera el backend
    const body = {
      name: 'themeOptions',
      slug: slug,
      content: content
    };
    
    // El interceptor agregará automáticamente el token
    return this.http.put(`${environment.URL}/setting-theme/${slug}`, body);
  }
  
}
