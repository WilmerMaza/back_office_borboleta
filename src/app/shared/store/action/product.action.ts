import { Params } from "../../interface/core.interface";
import { Product } from "../../interface/product.interface";

export class GetProducts {
  static readonly type = "[Product] Get";
  constructor(public payload?: Params) {}
}

export class CreateProduct {
  static readonly type = "[Product] Create";
  constructor(public payload: Product) {}
}

export class EditProduct {
  static readonly type = "[Product] Edit";
  constructor(public id: number) {}
}

export class UpdateProduct {
  static readonly type = "[Product] Update";
  constructor(public payload: Product, public id: number) {}
} 

export class UpdateProductStatus {
  static readonly type = "[Product] Update Status";
  constructor(public id: number, public status: boolean) {}
}

export interface ProductDiscountBulkPayload {
  productIds: number[];
  discount: number;
  is_sale_enable: boolean;
  sale_starts_at?: string | null;
  sale_expired_at?: string | null;
}

export class UpdateProductDiscountBulk {
  static readonly type = "[Product] Update Discount Bulk";
  constructor(public payload: ProductDiscountBulkPayload) {}
}

export class ApproveProductStatus {
  static readonly type = "[Product] Approve Status";
  constructor(public id: number, public status: boolean) {}
}

export class DeleteProduct {
  static readonly type = "[Product] Delete";
  constructor(public id: number) {}
}

export class DeleteAllProduct {
  static readonly type = "[Product] Delete All";
  constructor(public ids: number[]) {}
}

export class ReplicateProduct {
  static readonly type = "[Product] Replicate";
  constructor(public ids: number[]) {}
}

export class ImportProduct {
  static readonly type = "[Product] Import";
  constructor(public payload: File[]) {}
}

export class ExportProduct {
  static readonly type = "[Product] Export";
  constructor(public payload: Params) {}
}

export class Download {
  static readonly type = "[Product] Download";
  constructor(public payload: { product_id: number, variation_id?: number | null }) {}
}