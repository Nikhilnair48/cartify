import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CodePipelineSetup extends Construct {
  constructor(scope: Construct, id: string, artifactBucketName: string) {
    super(scope, id);

    const githubToken = secretsmanager.Secret.fromSecretNameV2(
      this,
      'GitHubToken',
      'github-token' // Ensure this is created in Secrets Manager
    );

    const sourceOutput = new codepipeline.Artifact();

    const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucketName);

    const pipeline = new codepipeline.Pipeline(this, 'ProductManagementPipeline', {
      pipelineName: 'ProductManagementPipeline',
      artifactBucket: artifactBucket,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipelineActions.GitHubSourceAction({
          actionName: 'GitHub_Source',
          owner: 'Nikhilnair48',
          repo: 'cartify',
          branch: 'main',
          oauthToken: githubToken.secretValue,
          output: sourceOutput,
          trigger: codepipelineActions.GitHubTrigger.WEBHOOK,
        }),
      ],
    });

    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'The CodePipeline for Product Management',
    });
  }
}
