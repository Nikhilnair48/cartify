import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

const createProductsTable = async () => {
  const params = {
    TableName: 'Products',
    KeySchema: [
      { AttributeName: 'ProductId', KeyType: 'HASH' }, // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'ProductId', AttributeType: 'S' }, // String type
    ],
    BillingMode: 'PAY_PER_REQUEST', // Auto-scaling billing
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log('Products table created successfully');
  } catch (error) {
    console.error('Error creating Products table:', error);
  }
};

const createProductTaxonomyAttributesTable = async () => {
  const params = {
    TableName: 'ProductTaxonomyAttributes',
    KeySchema: [
      { AttributeName: 'TaxonomyId', KeyType: 'HASH' }, // Partition Key
    ],
    AttributeDefinitions: [
      { AttributeName: 'TaxonomyId', AttributeType: 'S' }, // String type
      { AttributeName: 'ParentId', AttributeType: 'S' }, // String type
      { AttributeName: 'Name', AttributeType: 'S' }, // String type
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ParentIndex',
        KeySchema: [
          { AttributeName: 'ParentId', KeyType: 'HASH' }, // GSI Partition Key
          { AttributeName: 'Name', KeyType: 'RANGE' }, // GSI Sort Key
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST', // Auto-scaling billing
  };

  try {
    await client.send(new CreateTableCommand(params));
    console.log('ProductTaxonomyAttributes table created successfully');
  } catch (error) {
    console.error('Error creating ProductTaxonomyAttributes table:', error);
  }
};

const main = async () => {
  console.log('Creating DynamoDB tables...');
  await createProductsTable();
  await createProductTaxonomyAttributesTable();
  console.log('Tables created successfully!');
};

main().catch((error) => {
  console.error('Error in table creation:', error);
});
