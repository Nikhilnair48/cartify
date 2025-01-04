import { AppSyncResolverEvent } from 'aws-lambda';
import { CreateProductInput } from '../../src/utils/types';
import { handler } from '../../src/handlers/createProductHandler';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

describe('createProductHandler', () => {
const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    ddbMock.reset();
  });

  it('should create a product successfully', async () => {
    ddbMock.on(PutItemCommand).resolves({});

    const event: AppSyncResolverEvent<{ input: CreateProductInput }> = {
      arguments: {
        input: {
          Name: 'Test Product',
          Description: 'Sample description',
          Price: 100,
          Category: 'Electronics',
          Stock: 50,
        },
      },
      info: {
        fieldName: 'createProduct',
        parentTypeName: 'Mutation',
        variables: {},
        selectionSetList: [],
        selectionSetGraphQL: '',
      },
      source: null,
      request: {
        headers: {},
        domainName: "example.com"
      },
      identity: null,
      prev: null,
      stash: {},
    };

    const response = await handler(event);

    expect(response).toEqual({
      ProductId: expect.any(String),
      Name: 'Test Product',
      Description: 'Sample description',
      Price: 100,
      Category: 'Electronics',
      Stock: 50,
      CreatedAt: expect.any(String),
      UpdatedAt: expect.any(String),
    });
    
    expect(ddbMock.calls().length).toBe(1);
    expect(ddbMock.calls()[0].args[0].input).toEqual({
      TableName: import.meta.env.VITE_PRODUCTS_TABLE_NAME,
      Item: {
        ProductId: { S: expect.any(String) },
        Name: { S: 'Test Product' },
        Description: { S: 'Sample description' },
        Price: { N: '100' },
        Category: { S: 'Electronics' },
        Stock: { N: '50' },
        CreatedAt: { S: expect.any(String) },
        UpdatedAt: { S: expect.any(String) },
      },
    });
  });
});
