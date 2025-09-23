import { HttpClient } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { Observable, of } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { AccountUser } from "../interface/account.interface";
import { APP_CONFIG } from "../config/app.config";
import { isPlatformBrowser } from "@angular/common";

export interface AccountUserResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    email: string;
    country_code: string;
    phone: string;
    status: number;
    created_at: string;
    role: {
      id: number;
      name: string;
      guard_name: string;
    };
    permission?: Array<{
      id: number;
      name: string;
      guard_name: string;
    }>;
    permissions?: Array<{
      id: number;
      name: string;
      guard_name: string;
    }>;
  };
}

@Injectable({
  providedIn: "root",
})
export class AccountService {

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getUserDetails(): Observable<AccountUserResponse> {
    // ⚠️ En SSR: no hacer peticiones protegidas (no hay token)
    if (!isPlatformBrowser(this.platformId)) {
      return of({
        success: false,
        data: {
          id: 0,
          name: '',
          email: '',
          country_code: '',
          phone: '',
          status: 0,
          created_at: '',
          role: {
            id: 0,
            name: '',
            guard_name: ''
          }
        }
      });
    }

    // Solo en browser: hacer petición real
    return this.http.get<AccountUserResponse>(`${environment.URL}${APP_CONFIG.ENDPOINTS.USER_DETAILS}`);
  }
}
   

