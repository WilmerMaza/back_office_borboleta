import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AppSetting, GoogleReCaptcha, Setting } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  reCaptchaConfig: GoogleReCaptcha;

  constructor(private http: HttpClient) { }

  getSettingOption(): Observable<Setting> {
    return this.http.get<Setting>(`assets/data/settings.json`).pipe(
      catchError((error: HttpErrorResponse | any) => {
        // Si el archivo no existe o hay un error de parseo JSON (HTML en lugar de JSON)
        // Devolver un Observable con un objeto Setting vacío en lugar de propagar el error
        // Esto permite que la aplicación continúe funcionando aunque el archivo no exista
        // NO mostrar ningún console.warn ni error - silenciar completamente
        if (error?.status === 404 || 
            error?.status === 200 ||
            (error instanceof HttpErrorResponse && typeof error.error === 'string' && error.error.trim().startsWith('<!DOCTYPE')) ||
            (error?.message && String(error.message).includes('Unexpected token'))) {
          // Devolver un objeto Setting con valores por defecto sin ningún log
          return of({
            values: {} as any
          } as Setting);
        }
        // Para otros errores, propagar el error
        return throwError(() => error);
      })
    );
  }

  getAppSettingOption(): Observable<AppSetting> {
    return this.http.get<AppSetting>(`${environment.URL}/app/settings`);
  }
  async getReCaptchaConfig(): Promise<void> {
    // const config = await this.getSettingOption().toPromise();
    // this.reCaptchaConfig = config?.values?.google_reCaptcha!;
  }

}
