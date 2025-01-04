import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import existing DynamoDB tables
    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'Products');
    const productTaxonomyTable = dynamodb.Table.fromTableName(this, 'ProductTaxonomyAttributesTable', 'ProductTaxonomyAttributes');

    // Define the AppSync API
    const api = new appsync.GraphqlApi(this, 'ProductManagementApi', {
      name: 'ProductManagementApi',
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, '../src/schema.graphql')),
    });

    // Define the createProduct Lambda function with CDK Bundling
    const createProductLambda = new NodejsFunction(this, 'CreateProductHandler', {
      entry: path.join(__dirname, '../src/handlers/createProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler', // Ensure this matches the exported handler function
      bundling: {
        externalModules: ['aws-sdk'], // Exclude aws-sdk from the bundle
        target: 'node20', // Specify target runtime
      },
      environment: {
        PRODUCTS_TABLE_NAME: 'Products',
      },
    });

    // Define the getProduct Lambda function with CDK Bundling
    const getProductLambda = new NodejsFunction(this, 'GetProductHandler', {
      entry: path.join(__dirname, '../src/handlers/getProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node20',
      },
      environment: {
        PRODUCTS_TABLE_NAME: 'Products',
      },
    });

    // Grant permissions for Lambdas to access DynamoDB
    productsTable.grantReadWriteData(createProductLambda);
    productsTable.grantReadData(getProductLambda);

    // Add Lambda data sources to the AppSync API
    const createProductDataSource = api.addLambdaDataSource('CreateProductDataSource', createProductLambda);
    const getProductDataSource = api.addLambdaDataSource('GetProductDataSource', getProductLambda);

    // Define resolvers for AppSync API
    createProductDataSource.createResolver('CreateProductResolver', {
      typeName: 'Mutation',
      fieldName: 'createProduct',
    });

    getProductDataSource.createResolver('GetProductResolver', {
      typeName: 'Query',
      fieldName: 'getProduct',
    });

    // Output the GraphQL endpoint
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
  }
}
