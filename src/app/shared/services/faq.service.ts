import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Params } from '../interface/core.interface';
import { FaqModel } from '../interface/faq.interface';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  constructor(private http: HttpClient) {}

  getFaqs(payload?: Params): Observable<FaqModel> {
    return this.http.get<FaqModel>(`${environment.URL}/faq.json`, { params: payload });
  }

}
