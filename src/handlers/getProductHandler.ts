import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { Product } from '../utils/types';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ ProductId: string }>) => {
  try {
    const { ProductId } = event.arguments;

    if (!ProductId) {
      throw new Error('ProductId is required.');
    }

    const params = {
      TableName: import.meta.env.VITE_PRODUCTS_TABLE_NAME || 'Products',
      Key: { ProductId: { S: ProductId } },
    };

    const result = await client.send(new GetItemCommand(params));

    if (!result.Item) {
      throw new Error('Product not found.');
    }

    const product = unmarshall(result.Item) as Product;

    return product;
  } catch (error: any) {
    console.error('Error fetching product:', error.message);
    throw new Error('Failed to fetch product.');
  }
};
