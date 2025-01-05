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

    const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucketName);

    const pipeline = new codepipeline.Pipeline(this, 'ProductManagementPipeline', {
      pipelineName: 'ProductManagementPipeline',
      pipelineType: codepipeline.PipelineType.V2,
      artifactBucket: artifactBucket,
    });

    const sourceOutput = new codepipeline.Artifact('SourceOutput');
    const buildOutput = new codepipeline.Artifact('BuildOutput');

    const sourceAction = new codepipeline_actions.CodeStarConnectionsSourceAction({
      actionName: 'GitHub_Source',
      owner: 'Nikhilnair48',
      repo: 'cartify',
      branch: 'main',
      connectionArn: codestarConnectionArn,
      output: sourceOutput,
      triggerOnPush: true,
    });

    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      projectName: 'ProductManagementBuildProject',
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
    });

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

    const deployAction = new codepipeline_actions.CloudFormationCreateUpdateStackAction({
      actionName: 'Deploy_CFN',
      stackName: 'ProductManagementStack',
      templatePath: buildOutput.atPath('cdk.out/ProductManagementStack.template.json'),
      adminPermissions: true,
    });

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [deployAction],
    });

    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'The CodePipeline for Product Management',
    });
  }
}
