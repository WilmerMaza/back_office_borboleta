import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ErrorService } from "../../shared/services/error.service";
import { LoggingService } from "../../shared/services/logging.service";
import { NotificationService } from "../../shared/services/notification.service";
import { Observable, catchError, throwError } from "rxjs";

@Injectable()
export class GlobalErrorHandlerInterceptor implements HttpInterceptor {
  constructor(
    private errorService: ErrorService,
    private logger: LoggingService,
    private notifier: NotificationService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse | any) => {
        // No mostrar notificación para errores 401 (ya los maneja AuthInterceptor)
        if (error?.status === 401) {
          return throwError(() => error);
        }

        // Verificar si es un archivo estático (assets/) que no existe
        // Estos errores deben ser silenciados completamente
        const isStaticAsset = this.isStaticAsset(request.url);
        const isJsonParseErr = this.isJsonParseError(error);
        const hasHtmlError = error instanceof HttpErrorResponse && this.hasHtmlResponse(error);
        
        // Si es un archivo estático con error de parseo JSON o HTML, silenciarlo completamente
        if (isStaticAsset && (isJsonParseErr || hasHtmlError || error?.status === 404)) {
          // Crear un error silencioso que será manejado por el servicio
          const silentError = new HttpErrorResponse({
            error: null,
            status: 404,
            statusText: 'Not Found',
            url: request.url
          });
          // No loggear, no notificar, solo propagar el error silenciosamente
          return throwError(() => silentError);
        }

        // Detectar errores de parseo JSON ANTES de procesar otros errores
        // Esto es crítico porque estos errores pueden venir en diferentes formas
        if (isJsonParseErr) {
          // Crear un HttpErrorResponse sintético con información útil
          const syntheticError = this.createSyntheticErrorResponse(error, request);
          
          // No mostrar notificación para errores 401
          if (syntheticError.status !== 401) {
            const errorMessage = this.errorService.getServerErrorMessage(syntheticError);
            
            console.error('Error de parseo JSON: El servidor respondió con HTML en lugar de JSON', {
              status: syntheticError.status,
              statusText: syntheticError.statusText,
              url: request.url,
              originalError: error
            });
            
            this.logger.logError(errorMessage);
            this.notifier.showError(errorMessage);
          }
          
          return throwError(() => syntheticError);
        }

        // Manejar HttpErrorResponse estándar
        if (error instanceof HttpErrorResponse) {
          // Detectar si el error tiene HTML en lugar de JSON (incluso con status 200)
          if (hasHtmlError) {
            // Crear un error sintético con status 404 si el original tenía 200
            const correctedError = error.status === 200 
              ? new HttpErrorResponse({
                  error: 'El servidor respondió con HTML en lugar de JSON. El recurso solicitado no existe.',
                  status: 404,
                  statusText: 'Not Found',
                  url: error.url || request.url,
                  headers: error.headers
                })
              : error;
            
            const errorMessage = this.errorService.getServerErrorMessage(correctedError);
            
            // No mostrar notificación para errores 401
            if (correctedError.status !== 401) {
              console.error('HTTP Error: El servidor respondió con HTML en lugar de JSON', {
                status: correctedError.status,
                statusText: correctedError.statusText,
                url: correctedError.url
              });
              
              this.logger.logError(errorMessage);
              this.notifier.showError(errorMessage);
            }
            
            return throwError(() => correctedError);
          }
          
          // Pasar el HttpErrorResponse completo al ErrorService para mejor manejo
          const errorMessage = this.errorService.getServerErrorMessage(error);
          
          // No mostrar notificación para errores 401 (ya los maneja AuthInterceptor)
          if (error.status !== 401) {
            // Loggear información del error de forma más informativa (solo si no es 401)
            console.error('HTTP Error:', error.error || error.message);
            this.logger.logError(errorMessage);
            this.notifier.showError(errorMessage);
          }
        } else {
          // Manejar errores que no son HttpErrorResponse (como SyntaxError de parseo JSON)
          // Verificar si es un error de parseo JSON que no fue detectado antes
          if (error instanceof SyntaxError || error instanceof Error) {
            const errorStr = String(error.message || error);
            if (errorStr.includes('Unexpected token') && 
                (errorStr.includes('<!DOCTYPE') || errorStr.includes('<html'))) {
              // Si es un archivo estático, silenciarlo
              if (isStaticAsset) {
                const silentError = new HttpErrorResponse({
                  error: null,
                  status: 404,
                  statusText: 'Not Found',
                  url: request.url
                });
                return throwError(() => silentError);
              }
              
              // Es un error de parseo JSON, crear HttpErrorResponse sintético
              const syntheticError = this.createSyntheticErrorResponse(error, request);
              const errorMessage = this.errorService.getServerErrorMessage(syntheticError);
              
              // No mostrar notificación para errores 401
              if (syntheticError.status !== 401) {
                console.error('Error de parseo JSON (SyntaxError): El servidor respondió con HTML', {
                  url: request.url,
                  originalError: error
                });
                
                this.logger.logError(errorMessage);
                this.notifier.showError(errorMessage);
              }
              
              return throwError(() => syntheticError);
            }
          }
          
          // Manejar otros errores que no son HttpErrorResponse
          const errorMessage = this.errorService.getClientErrorMessage(error);
          
          // No mostrar notificación si el error tiene status 401
          if (error?.status !== 401) {
            console.error('Error no HTTP:', error);
            this.logger.logError(errorMessage);
            this.notifier.showError(errorMessage);
          }
        }

        // Rethrow the error to propagate it down the error handling chain
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si la URL es un archivo estático (assets/)
   */
  private isStaticAsset(url: string): boolean {
    if (!url) return false;
    return url.includes('/assets/') || url.startsWith('assets/');
  }

  /**
   * Detecta si el error es un error de parseo JSON
   */
  private isJsonParseError(error: any): boolean {
    if (!error) return false;
    
    // Convertir todo a string para comparar
    const errorStr = String(error);
    const message = error?.message ? String(error.message) : '';
    const errorProp = error?.error ? String(error.error) : '';
    
    // Buscar el patrón de error de parseo JSON
    const hasUnexpectedToken = errorStr.includes('Unexpected token') || 
                              message.includes('Unexpected token') ||
                              errorProp.includes('Unexpected token');
    
    const hasHtml = errorStr.includes('<!DOCTYPE') || 
                   errorStr.includes('<!doctype') ||
                   errorStr.includes('<html') ||
                   errorStr.includes('<HTML') ||
                   message.includes('<!DOCTYPE') ||
                   message.includes('<!doctype') ||
                   message.includes('<html') ||
                   errorProp.includes('<!DOCTYPE') ||
                   errorProp.includes('<!doctype') ||
                   errorProp.includes('<html');
    
    // También verificar si es un SyntaxError (típico de parseo JSON)
    if (error instanceof SyntaxError && hasUnexpectedToken) {
      return true;
    }
    
    return hasUnexpectedToken && hasHtml;
  }

  /**
   * Detecta si un HttpErrorResponse contiene HTML en lugar de JSON
   */
  private hasHtmlResponse(error: HttpErrorResponse): boolean {
    if (!error) return false;
    
    // Verificar error.error
    if (error.error) {
      if (typeof error.error === 'string') {
        const trimmed = error.error.trim();
        return trimmed.startsWith('<!DOCTYPE') || 
               trimmed.startsWith('<!doctype') ||
               trimmed.startsWith('<html') ||
               trimmed.startsWith('<HTML');
      }
      
      // Si error.error es un objeto, verificar si tiene propiedades HTML
      if (typeof error.error === 'object') {
        const errorStr = JSON.stringify(error.error);
        return errorStr.includes('<!DOCTYPE') || 
               errorStr.includes('<!doctype') ||
               errorStr.includes('<html');
      }
    }
    
    // Verificar el mensaje del error
    if (error.message) {
      const message = String(error.message);
      return message.includes('<!DOCTYPE') || 
             message.includes('<!doctype') ||
             message.includes('<html');
    }
    
    return false;
  }

  /**
   * Crea un HttpErrorResponse sintético a partir de un error de parseo JSON
   */
  private createSyntheticErrorResponse(error: any, request: HttpRequest<any>): HttpErrorResponse {
    // Si el error original es un HttpErrorResponse, usar su información
    if (error instanceof HttpErrorResponse) {
      // Si tiene status 200 pero contiene HTML, cambiarlo a 404
      const status = error.status === 200 ? 404 : (error.status || 404);
      const statusText = error.status === 200 ? 'Not Found' : (error.statusText || 'Not Found');
      
      return new HttpErrorResponse({
        error: 'El servidor respondió con HTML en lugar de JSON. Esto generalmente indica que el recurso solicitado no existe.',
        status: status,
        statusText: statusText,
        url: error.url || request.url,
        headers: error.headers
      });
    }
    
    // Si no es HttpErrorResponse, crear uno nuevo
    const status = error?.status || error?.statusCode || 404;
    const statusText = error?.statusText || 'Not Found';
    const url = error?.url || request.url;
    
    return new HttpErrorResponse({
      error: 'El servidor respondió con HTML en lugar de JSON. Esto generalmente indica que el recurso solicitado no existe.',
      status: status,
      statusText: statusText,
      url: url
    });
  }
}
