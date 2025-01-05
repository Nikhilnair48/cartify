import { AppSyncResolverEvent } from 'aws-lambda';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { UpdateProductInput } from '../utils/types';
import { getSecrets } from '../utils/secretsManager';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event: AppSyncResolverEvent<{ ProductId: string; input: UpdateProductInput }>) => {
  try {
    console.log(event);
    const secrets = await getSecrets('product-management-env');
    const PRODUCTS_TABLE_NAME = secrets.PRODUCTS_TABLE_NAME || 'Products';

    console.log(PRODUCTS_TABLE_NAME);

    const { ProductId, input } = event.arguments;

    if (!ProductId) {
      throw new Error('ProductId is required.');
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (input.Name) {
      updateExpressions.push('#name = :name');
      expressionAttributeValues[':name'] = { S: input.Name }; // Dynamically typed as 'S' for string
      expressionAttributeNames['#name'] = 'Name';
    }
    
    if (input.Price) {
      updateExpressions.push('#price = :price');
      expressionAttributeValues[':price'] = { N: input.Price.toString() }; // 'N' for number
      expressionAttributeNames['#price'] = 'Price';
    }

    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { ProductId: { S: ProductId } },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
    };

    console.log(params);

    await client.send(new UpdateItemCommand(params));

    const getParams = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { ProductId: { S: ProductId } },
    };

    console.log('Get Params:', getParams);

    const result = await client.send(new GetItemCommand(getParams));

    if (!result.Item) {
      throw new Error(`Product with ID ${ProductId} not found after update.`);
    }

    const updatedProduct = unmarshall(result.Item);
    console.log('Updated Product:', updatedProduct);

    return updatedProduct;
  } catch (error: any) {
    console.error('Error updating product:', error.message);
    throw new Error('Failed to update product.');
  }
};
