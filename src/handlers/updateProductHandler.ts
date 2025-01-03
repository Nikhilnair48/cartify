import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { UpdateProductInput } from '../utils/types';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ ProductId: string; input: UpdateProductInput }>) => {
  try {
    const { ProductId, input } = event.arguments;

    if (!ProductId) {
      throw new Error('ProductId is required.');
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (input.Name) {
      updateExpressions.push('#name = :name');
      expressionAttributeValues[':name'] = input.Name;
      expressionAttributeNames['#name'] = 'Name';
    }

    if (input.Price) {
      updateExpressions.push('Price = :price');
      expressionAttributeValues[':price'] = input.Price;
    }

    const params = {
      TableName: process.env.PRODUCTS_TABLE_NAME || 'Products',
      Key: { ProductId: { S: ProductId } },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    };

    await client.send(new UpdateItemCommand(params));

    return true;
  } catch (error) {
    console.error('Error updating product:', error.message);
    throw new Error('Failed to update product.');
  }
};
