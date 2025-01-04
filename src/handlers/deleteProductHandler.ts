import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { getSecrets } from '../utils/secretsManager';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ ProductId: string }>) => {
  try {
    const secrets = await getSecrets('product-management-env');
    const PRODUCTS_TABLE_NAME = secrets.PRODUCTS_TABLE_NAME || 'Products';

    const { ProductId } = event.arguments;

    if (!ProductId) {
      throw new Error('ProductId is required.');
    }

    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { ProductId: { S: ProductId } },
    };

    await client.send(new DeleteItemCommand(params));

    return true;
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    throw new Error('Failed to delete product.');
  }
};
