import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DynamoDBTables extends Construct {
  public readonly productsTable: dynamodb.Table;
  public readonly productTaxonomyTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Define Products Table
    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'Products',
      partitionKey: { name: 'ProductId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Define ProductTaxonomyAttributes Table
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

    // Add GSI for ProductTaxonomyAttributes
    this.productTaxonomyTable.addGlobalSecondaryIndex({
      indexName: 'ParentIndex',
      partitionKey: { name: 'ParentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Name', type: dynamodb.AttributeType.STRING },
    });
  }
}
