import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { NotificationService } from "../../shared/services/notification.service";
import { Observable, catchError, throwError } from "rxjs";
import { AuthClear } from "../../shared/store/action/auth.action";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { environment } from "src/environments/environment.development";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly NODE_API = environment.URL;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private store: Store,
    private notificationService: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // ⚠️ En SSR: no hay localStorage, salimos tal cual
    if (isPlatformServer(this.platformId)) {
      return next.handle(req);
    }

    const isNode = this.isNodeApi(req.url);
    
    if (!isNode) {
      return next.handle(req);
    }

    const token = this.getValidJwtFromStateOrStorage();

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.notificationService.notification = false;
          this.store.dispatch(new AuthClear());
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private isNodeApi(url: string): boolean {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return u.origin === this.NODE_API.replace ('/api', '');
    } catch { 
      return false; 
    }
  }

  private getValidJwtFromStateOrStorage(): string | null {
    // 1) Del store (rehidratado por NGXS Storage Plugin)
    let token = this.store.selectSnapshot(s => s.auth?.access_token as string | null);

    // 2) Fallback a localStorage por si acaso
    if (!token && typeof window !== 'undefined') {
      // Prueba varias llaves típicas
      const candidates = ['access_token', 'token', 'jwt', 'node_jwt'];
      
      for (const key of candidates) {
        const raw = localStorage.getItem(key);
        const cleaned = this.normalizeToken(raw);
        if (this.looksLikeJwt(cleaned)) {
          token = cleaned;
          break;
        }
      }
    }

    // Solo devuelve si parece JWT (3 segmentos)
    return this.looksLikeJwt(token) ? token : null;
  }

  private normalizeToken(raw: string | null): string | null {
    if (!raw) return null;
    const trimmed = raw.trim();
    // Si alguien guardó "Bearer XXX"
    return trimmed.startsWith('Bearer ') ? trimmed.slice(7).trim() : trimmed;
  }

  private looksLikeJwt(token: string | null): boolean {
    return !!token && token.split('.').length === 3;
  }
}