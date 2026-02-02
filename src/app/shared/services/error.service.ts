import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  /**
   * Detecta si un string es HTML (comienza con <!DOCTYPE, <html, etc.)
   */
  private isHtmlString(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const trimmed = value.trim();
    return trimmed.startsWith('<!DOCTYPE') || 
           trimmed.startsWith('<html') || 
           trimmed.startsWith('<!doctype') ||
           trimmed.startsWith('<HTML');
  }

  /**
   * Detecta si un error es un error de parseo JSON
   */
  private isJsonParseError(error: any): boolean {
    if (!error) return false;
    
    const errorStr = String(error);
    const message = error?.message ? String(error.message) : '';
    
    return (errorStr.includes('Unexpected token') || message.includes('Unexpected token')) &&
           (errorStr.includes('<!DOCTYPE') || errorStr.includes('<html') || 
            message.includes('<!DOCTYPE') || message.includes('<html'));
  }

  /**
   * Extrae un mensaje de error de forma segura de diferentes tipos de errores
   */
  getClientErrorMessage(error: any): string {
    // Si es un string HTML, devolver mensaje genérico
    if (this.isHtmlString(error)) {
      return 'El servidor respondió con una página de error. Por favor, intente nuevamente.';
    }

    // Si es un HttpErrorResponse, extraer el mensaje del error
    if (error instanceof HttpErrorResponse) {
      return this.getServerErrorMessage(error);
    }

    // Si es un objeto Error estándar
    if (error instanceof Error) {
      if (isPlatformBrowser(this.platformId) && navigator) {
        return navigator.onLine ? 
          (error.message || 'Something Went Wrong') : 'No Internet Connection';
      }
      return error.message || 'An error occurred.';
    }

    // Si es un objeto con propiedad message
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message;
      // Verificar si el mensaje es HTML
      if (this.isHtmlString(message)) {
        return 'El servidor respondió con una página de error. Por favor, intente nuevamente.';
      }
      return message || 'Something Went Wrong';
    }

    // Si es un string normal
    if (typeof error === 'string') {
      return error || 'Something Went Wrong';
    }

    // Fallback genérico
    if (isPlatformBrowser(this.platformId) && navigator) {
      return navigator.onLine ? 'Something Went Wrong' : 'No Internet Connection';
    }
    
    return 'An error occurred.';
  }

  /**
   * Extrae mensaje de error de HttpErrorResponse
   */
  getServerErrorMessage(error: HttpErrorResponse): string {
    // Si es un error 401, retornar string vacío para que no se muestre notificación
    // El AuthInterceptor ya maneja la redirección
    if (error.status === 401) {
      return '';
    }

    // Detectar errores de parseo JSON (cuando se intenta parsear HTML como JSON)
    if (this.isJsonParseError(error.error) || this.isJsonParseError(error)) {
      // Si la URL es de un archivo estático que no existe, dar un mensaje más específico
      if (error.url && (error.url.includes('/assets/') || error.url.includes('.js'))) {
        return 'Archivo no encontrado. El recurso solicitado no existe en el servidor.';
      }
      return 'El servidor respondió con HTML en lugar de JSON. Esto generalmente indica que el recurso solicitado no existe.';
    }

    // Si error.error es un string HTML
    if (this.isHtmlString(error.error)) {
      // Devolver mensaje basado en el status code
      switch (error.status) {
        case 404:
          return 'Recurso no encontrado. Por favor, verifique la URL.';
        case 500:
          return 'Error interno del servidor. Por favor, intente más tarde.';
        case 503:
          return 'Servicio no disponible. Por favor, intente más tarde.';
        default:
          return `Error del servidor (${error.status}). Por favor, intente nuevamente.`;
      }
    }

    // Si error.error es un objeto con mensaje
    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      const message = error.error.message;
      // Verificar si el mensaje es HTML o si es un mensaje de token
      if (this.isHtmlString(message) || message === 'Token de acceso requerido') {
        return '';
      }
      return message;
    }

    // Si error.error es un string normal
    if (error.error && typeof error.error === 'string' && !this.isHtmlString(error.error)) {
      // Verificar si el string contiene un error de parseo JSON o es mensaje de token
      if (this.isJsonParseError(error.error) || error.error === 'Token de acceso requerido') {
        return '';
      }
      return error.error;
    }

    // Si hay un mensaje en el error
    if (error.message) {
      // Verificar si el mensaje es un error de parseo JSON o es mensaje de token
      if (this.isJsonParseError(error.message) || error.message.includes('Token de acceso requerido')) {
        return '';
      }
      return error.message;
    }

    // Fallback basado en status code
    switch (error.status) {
      case 0:
        return 'No se pudo conectar al servidor. Verifique su conexión.';
      case 400:
        return 'Solicitud inválida. Por favor, verifique los datos enviados.';
      case 401:
        return ''; // No mostrar mensaje para 401
      case 403:
        return 'Acceso denegado. No tiene permisos para esta acción.';
      case 404:
        return 'Recurso no encontrado.';
      case 500:
        return 'Error interno del servidor. Por favor, intente más tarde.';
      case 503:
        return 'Servicio no disponible. Por favor, intente más tarde.';
      default:
        return error.status ? 
          `Error del servidor (${error.status}). Por favor, intente nuevamente.` :
          'Ocurrió un error. Por favor, intente nuevamente.';
    }
  } 

}
