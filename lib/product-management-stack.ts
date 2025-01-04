import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { CodePipelineSetup } from './code-pipeline-setup';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    new CodePipelineSetup(this, 'PipelineSetup', artifactBucket.bucketName);

    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'Products');
    const productTaxonomyTable = dynamodb.Table.fromTableName(this, 'ProductTaxonomyAttributesTable', 'ProductTaxonomyAttributes');

    const api = new appsync.GraphqlApi(this, 'ProductManagementApi', {
      name: 'ProductManagementApi',
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, '../src/schema.graphql')),
    });

    const secretArn = `arn:aws:secretsmanager:${this.region}:${this.account}:secret:product-management-env`;

    const secretPolicy = new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [secretArn],
    });

    const createProductLambda = new NodejsFunction(this, 'CreateProductHandler', {
      entry: path.join(__dirname, '../src/handlers/createProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node20',
      },
      environment: {
        PRODUCTS_TABLE_NAME: 'Products',
      }
    });
    createProductLambda.addToRolePolicy(secretPolicy);

    const getProductLambda = new NodejsFunction(this, 'GetProductHandler', {
      entry: path.join(__dirname, '../src/handlers/getProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node20',
      },
    });
    getProductLambda.addToRolePolicy(secretPolicy);

    // Grant table permissions to Lambdas
    productsTable.grantReadWriteData(createProductLambda);
    productsTable.grantReadData(getProductLambda);

    // Add data sources to AppSync
    const createProductDataSource = api.addLambdaDataSource('CreateProductDataSource', createProductLambda);
    const getProductDataSource = api.addLambdaDataSource('GetProductDataSource', getProductLambda);

    createProductDataSource.createResolver('CreateProductResolver', {
      typeName: 'Mutation',
      fieldName: 'createProduct',
    });

    getProductDataSource.createResolver('GetProductResolver', {
      typeName: 'Query',
      fieldName: 'getProduct',
    });

    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: artifactBucket.bucketName,
      description: 'Artifact bucket used by CodePipeline',
    });

    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
  }
}