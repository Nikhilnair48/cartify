export interface Product {
  ProductId: string;
  Name: string;
  Description?: string;
  Price: number;
  Category: string; // TaxonomyId
  Stock: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ProductTaxonomyAttribute {
  TaxonomyId: string;
  Name: string;
  Description?: string;
  ParentId?: string;
  Type: string;
}

export interface CreateProductInput {
  Name: string;
  Description?: string;
  Price: number;
  Category: string;
  Stock: number;
}

export interface UpdateProductInput {
  Name?: string;
  Description?: string;
  Price?: number;
  Category?: string;
  Stock?: number;
}
