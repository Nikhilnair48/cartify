import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { validateProductInput } from '../utils/validation';
import { CreateProductInput, Product } from '../utils/types';
import { v4 as uuidv4 } from 'uuid';
import { getSecrets } from '../utils/secretsManager';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ input: CreateProductInput }>) => {
  try {
    const secrets = await getSecrets('product-management-env');
    const PRODUCTS_TABLE_NAME = secrets.PRODUCTS_TABLE_NAME || 'Products';

    const { input } = event.arguments;
    validateProductInput(input);

    const product: Product = {
      ProductId: uuidv4(),
      Name: input.Name,
      Description: input.Description || '',
      Price: input.Price,
      Category: input.Category,
      Stock: input.Stock,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
    };

    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Item: marshall(product),
    };

    await client.send(new PutItemCommand(params));

    return product;
  } catch (error: any) {
    console.error('Error creating product:', error.message);
    throw new Error('Failed to create product.');
  }
};
