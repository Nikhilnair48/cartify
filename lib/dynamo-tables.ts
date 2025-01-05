import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBTables extends Construct {
  public readonly productsTable: dynamodb.Table;
  public readonly productTaxonomyTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'Products',
      partitionKey: { name: 'ProductId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.productTaxonomyTable = new dynamodb.Table(
      this,
      'ProductTaxonomyAttributesTable',
      {
        tableName: 'ProductTaxonomyAttributes',
        partitionKey: {
          name: 'TaxonomyId',
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      },
    );

    this.productTaxonomyTable.addGlobalSecondaryIndex({
      indexName: 'ParentIndex',
      partitionKey: { name: 'ParentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Name', type: dynamodb.AttributeType.STRING },
    });
  }
}
