import * as cdk from 'aws-cdk-lib';
import { ProductManagementStack } from '../lib/product-management-stack';

const app = new cdk.App();
new ProductManagementStack(app, 'ProductManagementStack');
