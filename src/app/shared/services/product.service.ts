import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { ProductModel } from "../interface/product.interface";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  getProducts(payload?: Params): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${environment.URLS}/products`, { params: payload })
      .pipe(
        catchError(this.handleError)
      );
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${environment.URLS}/products`, product)
      .pipe(
        catchError(this.handleError)
      );
  }
}
