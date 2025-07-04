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
    return this.http.get<ProductModel>(`${environment.URL}/products`, {
      params: payload,
    });
  }
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${environment.URL}/products`, product);
  }

  updateProduct(product: Product, id: number): Observable<Product> {
    return this.http.put<Product>(`${environment.URL}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    if (!id || id === undefined || id === null) {
      throw new Error('Product ID is required for deletion');
    }
    return this.http.delete(`${environment.URL}/products/${id}`);
  }

  updateProductStatus(id: number, status: boolean): Observable<any> {
    if (!id || id === undefined || id === null) {
      throw new Error('Product ID is required for status update');
    }
    return this.http.put(`${environment.URL}/products/${id}`, { status });
  }

  approveProduct(id: number, status: boolean): Observable<any> {
    if (!id || id === undefined || id === null) {
      throw new Error('Product ID is required for approval');
    }
    return this.http.put(`${environment.URL}/products/${id}`, { 
      is_approved: status,
      published_at: status ? new Date().toISOString() : null
    });
  }
}
