import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { APP_CONFIG } from "../config/app.config";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  country_code: string;
  role_id: number;
  status: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    user: {
      id: number;
      name: string;
      email: string;
      country_code: string;
      phone: string;
      status: number;
      created_at: string;
    };
  };
}

export interface UserDetails {
  id: number;
  name: string;
  email: string;
  country_code: string;
  phone: string;
  status: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(loginData: LoginRequest): Observable<AuthResponse> {
    // Usar backend real de Node.js
    return this.http.post<AuthResponse>(`${environment.URL}${APP_CONFIG.ENDPOINTS.LOGIN}`, loginData);
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.URL}/auth/register`, registerData);
  }

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${environment.URL}/auth/me`);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${environment.URL}/auth/logout`, {});
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('access_token');
      return token && token !== 'null' && token !== 'undefined';
    }
    return false;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('access_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('access_token');
    }
  }

  // Método para verificar si el token es válido
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Decodificar el JWT para verificar expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  }

  // Método para obtener información del usuario del token
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.email,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }
}
