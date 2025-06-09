import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { Product, ProductModel } from "../interface/product.interface";

@Injectable({
  providedIn: "root",
})
export class ProductService {

  constructor(private http: HttpClient) {}

  getProducts(payload?: Params): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${environment.apiUrl}/products`, {
      params: payload,
    });
  }
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product);
  }

  updateProduct(product: Product, id: number): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, product);
  }
}
