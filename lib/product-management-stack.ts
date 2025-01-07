// product-management-stack.ts

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CodePipelineSetup } from './code-pipeline-setup';
import { fileURLToPath } from 'url';

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

    const codestarConnectionArn = 'arn:aws:codeconnections:ap-south-1:522814699880:connection/b93046b1-d38a-41a0-a873-a05518cc5d61';

    new CodePipelineSetup(this, 'PipelineSetup', artifactBucket.bucketName, codestarConnectionArn);

    const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'Products');
    const productTaxonomyTable = dynamodb.Table.fromTableName(
      this,
      'ProductTaxonomyAttributesTable',
      'ProductTaxonomyAttributes'
    );

    const api = new appsync.GraphqlApi(this, 'ProductManagementApi', {
      name: 'ProductManagementApi',
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, '../src/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    const secretArn = `arn:aws:secretsmanager:${this.region}:${this.account}:secret:product-management-env`;
    const secretPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: [secretArn],
    });

    const createProductLambda = new NodejsFunction(this, 'CreateProductHandler', {
      entry: path.join(__dirname, '../src/handlers/createProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X, // Updated runtime to Node.js 16.x
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node16',
      },
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });
    createProductLambda.addToRolePolicy(secretPolicy);

    const getProductLambda = new NodejsFunction(this, 'GetProductHandler', {
      entry: path.join(__dirname, '../src/handlers/getProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node16',
      },
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });
    getProductLambda.addToRolePolicy(secretPolicy);

    const deleteProductLambda = new NodejsFunction(this, 'DeleteProductHandler', {
      entry: path.join(__dirname, '../src/handlers/deleteProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node16',
      },
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });
    deleteProductLambda.addToRolePolicy(secretPolicy);

    const updateProductLambda = new NodejsFunction(this, 'UpdateProductHandler', {
      entry: path.join(__dirname, '../src/handlers/updateProductHandler.ts'),
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      bundling: {
        externalModules: ['aws-sdk'],
        target: 'node16',
      },
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    });
    updateProductLambda.addToRolePolicy(secretPolicy);

    productsTable.grantReadWriteData(createProductLambda);
    productsTable.grantReadData(getProductLambda);
    productsTable.grantWriteData(deleteProductLambda);
    productsTable.grantWriteData(updateProductLambda);

    const createProductDataSource = api.addLambdaDataSource('CreateProductDataSource', createProductLambda);
    const getProductDataSource = api.addLambdaDataSource('GetProductDataSource', getProductLambda);
    const deleteProductDataSource = api.addLambdaDataSource('DeleteProductDataSource', deleteProductLambda);
    const updateProductDataSource = api.addLambdaDataSource('UpdateProductDataSource', updateProductLambda);

    createProductDataSource.createResolver('CreateProductResolver', {
      typeName: 'Mutation',
      fieldName: 'createProduct',
    });

    getProductDataSource.createResolver('GetProductResolver', {
      typeName: 'Query',
      fieldName: 'getProduct',
    });

    deleteProductDataSource.createResolver('DeleteProductResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteProduct',
    });

    updateProductDataSource.createResolver('UpdateProductResolver', {
      typeName: 'Mutation',
      fieldName: 'updateProduct',
    });

    new cdk.CfnOutput(this, 'ArtifactBucketName', {
      value: artifactBucket.bucketName,
      description: 'Artifact bucket used by CodePipeline',
    });
  }
}
