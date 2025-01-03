import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBTables } from './dynamo-tables';

export class ProductManagementStack extends cdk.Stack {
  public readonly productsTable: cdk.aws_dynamodb.Table;
  public readonly productTaxonomyTable: cdk.aws_dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Initialize DynamoDB Tables
    const dynamoDBTables = new DynamoDBTables(this, 'DynamoDBTables');
    this.productsTable = dynamoDBTables.productsTable;
    this.productTaxonomyTable = dynamoDBTables.productTaxonomyTable;

    // Add more resources here (e.g., Lambda functions, AppSync APIs, etc.)
  }
}
