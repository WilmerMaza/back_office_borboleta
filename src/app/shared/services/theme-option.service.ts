import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { Option, ThemeOption } from '../interface/theme-option.interface';

const DEFAULT_THEME_SLUG = 'fashion_one';

@Injectable({
  providedIn: 'root'
})
export class ThemeOptionService {

  constructor(private http: HttpClient) { }

  /**
   * GET /api/setting-theme/{slug} - sin s en setting.
   * Mapea content a options si la API devuelve { content }.
   */
  getThemeOption(): Observable<ThemeOption> {
    return this.http.get<any>(`${environment.URL}/setting-theme/${DEFAULT_THEME_SLUG}`).pipe(
      map((result) => {
        if (result?.options) return result as ThemeOption;
        const content = result?.content ?? result?.data?.content ?? {};
        return {
          id: result?.id ?? 1,
          options: {
            ...(result?.options ?? {}),
            promotional_banner: content?.promotional_banner ?? {
              is_enable: true,
              text: '',
              background_color: '#212121',
              text_color: '#ffffff',
              font_family: 'Montserrat'
            }
          } as Option
        };
      })
    );
  }

  /**
   * PUT /api/setting-theme/{slug} - sin s en setting.
   * Obtiene el content actual, fusiona promotional_banner y guarda.
   */
  updateThemeOption(options: Option): Observable<ThemeOption | { options: Option; message?: string }> {
    if (options?.promotional_banner) {
      return this.updatePromotionalBannerViaThemeContent(options);
    }
    return of({ options, message: 'Theme options actualizados' });
  }

  /**
   * Guarda promotional_banner vía /api/setting-theme/{slug} (endpoint que sí existe).
   */
  private updatePromotionalBannerViaThemeContent(options: Option): Observable<{ options: Option; message?: string }> {
    const slug = DEFAULT_THEME_SLUG;
    const promo = options?.promotional_banner ?? {
      is_enable: true,
      text: '',
      background_color: '#212121',
      text_color: '#ffffff',
      font_family: 'Montserrat'
    };
    return this.http.get<any>(`${environment.URL}/setting-theme/${slug}`).pipe(
      switchMap((theme) => {
        const content = theme?.content ?? theme?.data?.content ?? {};
        const body = {
          name: theme?.name ?? 'themeOptions',
          slug: theme?.slug ?? slug,
          content: { ...content, promotional_banner: promo }
        };
        return this.http.put<any>(`${environment.URL}/setting-theme/${slug}`, body);
      }),
      switchMap((result) => of({
        options,
        message: result?.message || 'Banner promocional guardado correctamente'
      }))
    );
  }
}
