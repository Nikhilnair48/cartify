import { Product, ProductTaxonomyAttribute } from './types';

/**
 * Validates the input for creating or updating a product.
 * @param input Partial<Product>
 */
export const validateProductInput = (input: Partial<Product>): void => {
  if (!input.Name || typeof input.Name !== 'string') {
    throw new Error('Name is required and must be a string.');
  }
  if (input.Description && typeof input.Description !== 'string') {
    throw new Error('Description must be a string.');
  }
  if (typeof input.Price !== 'number' || input.Price <= 0) {
    throw new Error('Price is required and must be a positive number.');
  }
  if (!input.Category || typeof input.Category !== 'string') {
    throw new Error('Category is required and must be a string.');
  }
  if (typeof input.Stock !== 'number' || input.Stock < 0) {
    throw new Error('Stock is required and must be a non-negative number.');
  }
};

/**
 * Validates the input for a taxonomy category.
 * @param input Partial<ProductTaxonomyAttribute>
 */
export const validateTaxonomyInput = (input: Partial<ProductTaxonomyAttribute>): void => {
  if (!input.TaxonomyId || typeof input.TaxonomyId !== 'string') {
    throw new Error('TaxonomyId is required and must be a string.');
  }
  if (!input.Name || typeof input.Name !== 'string') {
    throw new Error('Name is required and must be a string.');
  }
};
