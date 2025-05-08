import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { NoticeModel } from '../interface/notice.interface';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  constructor(private http: HttpClient) {}
  
  getNotice(payload?: Params): Observable<NoticeModel> {
    return this.http.get<NoticeModel>(`${environment.URL}/notice.json`, { params: payload });
  }
 
}
