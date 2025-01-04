import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { validateProductInput } from '../utils/validation';
import { CreateProductInput, Product } from '../utils/types';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ input: CreateProductInput }>) => {
  try {
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
      TableName: process.env.PRODUCTS_TABLE_NAME || 'Products',
      Item: marshall(product),
    };

    await client.send(new PutItemCommand(params));

    return product;
  } catch (error: any) {
    console.error('Error creating product:', error.message);
    throw new Error('Failed to create product.');
  }
};
