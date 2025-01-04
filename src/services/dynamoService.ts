import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  AttributeValue,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

const dynamoClient = new DynamoDBClient({});

/**
 * Get an item by primary key.
 */
export const getItem = async <T>(
  tableName: string,
  key: Record<string, AttributeValue>,
): Promise<T | null> => {
  try {
    const result = await dynamoClient.send(
      new GetItemCommand({ TableName: tableName, Key: key }),
    );
    return result.Item ? (unmarshall(result.Item) as T) : null;
  } catch (error) {
    console.error(`Error fetching item from ${tableName}`, error);
    throw new Error('Error fetching item.');
  }
};

/**
 * Create or replace an item.
 */
export const putItem = async <T>(tableName: string, item: T): Promise<void> => {
  try {
    const marshalledItem = marshall(item);
    await dynamoClient.send(
      new PutItemCommand({ TableName: tableName, Item: marshalledItem }),
    );
  } catch (error) {
    console.error(`Error putting item into ${tableName}`, error);
    throw new Error('Error saving item.');
  }
};

/**
 * Update an existing item.
 */
export const updateItem = async (
  tableName: string,
  key: Record<string, AttributeValue>,
  updateExpression: string,
  expressionAttributeValues: Record<string, AttributeValue>,
  expressionAttributeNames?: Record<string, string>,
): Promise<void> => {
  try {
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(command);
    console.log(`Item updated in ${tableName}:`, result.Attributes);
  } catch (error) {
    console.error(`Error updating item in ${tableName}:`, error);
    throw new Error('Error updating item.');
  }
};

/**
 * Delete an item by primary key.
 */
export const deleteItem = async (
  tableName: string,
  key: Record<string, AttributeValue>,
): Promise<void> => {
  try {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: key,
    });

    await dynamoClient.send(command);
    console.log(`Item deleted from ${tableName}.`);
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    throw new Error('Error deleting item.');
  }
};
