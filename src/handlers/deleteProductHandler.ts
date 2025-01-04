import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ ProductId: string }>) => {
  try {
    const { ProductId } = event.arguments;

    if (!ProductId) {
      throw new Error('ProductId is required.');
    }

    const params = {
      TableName: process.env.PRODUCTS_TABLE_NAME || 'Products',
      Key: { ProductId: { S: ProductId } },
    };

    await client.send(new DeleteItemCommand(params));

    return true;
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    throw new Error('Failed to delete product.');
  }
};
