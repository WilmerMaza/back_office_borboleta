import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { AppSetting, GoogleReCaptcha, Setting } from '../interface/setting.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  reCaptchaConfig: GoogleReCaptcha;

  constructor(private http: HttpClient) { }

  getSettingOption(): Observable<Setting> {
    return this.http.get<Setting>(`${environment.URL}/settings.json`);
  }

  getAppSettingOption(): Observable<AppSetting> {
    return this.http.get<AppSetting>(`${environment.URL}/app/settings`);
  }
  async getReCaptchaConfig(): Promise<void> {
    // const config = await this.getSettingOption().toPromise();
    // this.reCaptchaConfig = config?.values?.google_reCaptcha!;
  }

}
