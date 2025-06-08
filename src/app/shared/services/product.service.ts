import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { Params } from "../interface/core.interface";
import { ProductModel, Product } from "../interface/product.interface";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private apiUrl = 'http://localhost:3001/api/products';

  constructor(private http: HttpClient) {}

  getProducts(payload?: Params): Observable<ProductModel> {
    console.log('Obteniendo productos con payload:', payload);
    return this.http.get<ProductModel>(`${this.apiUrl}`, { params: payload }).pipe(
      tap(response => {
        console.log('Respuesta del servicio de productos:', response);
        if (response?.data) {
          response.data.forEach(product => {
            if (!product.sale_price && product.price) {
              product.sale_price = product.price;
            }
            console.log(`Producto ${product.name}:`, {
              price: product.price,
              sale_price: product.sale_price,
              discount: product.discount
            });
          });
        }
      })
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, product);
  }
}
