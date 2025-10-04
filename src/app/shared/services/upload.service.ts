import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  constructor(private http: HttpClient) {}
  
  // Obtener URL de descarga
  getDownloadURL(filePath: string, expiresIn: number = 3600): Observable<any> {
    return this.http.post(`${environment.URL}/upload/get-url`, {
      file_path: filePath,
      expires_in: expiresIn
    });
  }
  
  // Obtener múltiples URLs
  getDownloadURLs(filePaths: string[], expiresIn: number = 3600): Observable<any> {
    return this.http.post(`${environment.URL}/upload/get-urls`, {
      file_paths: filePaths,
      expires_in: expiresIn
    });
  }
  
  // Descargar archivo
  downloadFile(filePath: string): Observable<Blob> {
    return this.http.get(`${environment.URL}/upload/download-url/${filePath}`, {
      responseType: 'blob'
    });
  }
  
  // Eliminar archivo
  deleteFile(filePath: string): Observable<any> {
    return this.http.delete(`${environment.URL}/upload/${filePath}`);
  }
  
  // Verificar existencia
  checkFileExists(filePath: string): Observable<any> {
    return this.http.get(`${environment.URL}/upload/exists/${filePath}`);
  }
}
