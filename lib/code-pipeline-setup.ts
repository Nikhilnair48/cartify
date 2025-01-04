import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class CodePipelineSetup extends Construct {
  constructor(
    scope: Construct,
    id: string,
    artifactBucketName: string,
    codestarConnectionArn: string
  ) {
    super(scope, id);

    // Reference the existing artifact bucket
    const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucketName);

    // Define the Pipeline
    const pipeline = new codepipeline.Pipeline(this, 'ProductManagementPipeline', {
      pipelineName: 'ProductManagementPipeline',
      pipelineType: codepipeline.PipelineType.V2, // Explicitly set to V2
      artifactBucket: artifactBucket, // Use the specified artifact bucket
    });

    // Define Artifacts
    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const buildOutput = new codepipeline.Artifact('BuildOutput');

    // Source Stage using CodeStar Connections
    const sourceAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub_Source',
      owner: 'Nikhilnair48',
      repo: 'cartify',
      branch: 'main',
      connectionArn: codestarConnectionArn, // CodeStar Connection ARN
      output: sourceOutput,
      triggerOnPush: true, // Ensure pipeline triggers on push
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    // Define CodeBuild Project
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      projectName: 'ProductManagementBuildProject',
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
    });

    // Example: Grant CodeBuild permissions to interact with DynamoDB and Lambda
    // Assuming you have defined the DynamoDB tables and Lambda functions elsewhere
    // const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'Products');
    // productsTable.grantReadWriteData(buildProject);

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    // Deploy Stage using CloudFormation
    const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy_CFN',
      stackName: 'ProductManagementStack',
      templatePath: buildOutput.atPath('cdk.out/ProductManagementStack.template.json'),
      adminPermissions: true, // Consider refining permissions for least privilege
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });

    // Output the pipeline name
    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'The CodePipeline for Product Management',
    });
  }
}
