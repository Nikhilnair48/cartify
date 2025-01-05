# Cartify

A simple product management service to demonstrate a set of backend functionalities for a hypothetical eCommerce platform.

## Relevant Tools

- NodeJS: runtime for Lambda
- Typescript
- Vite: to build & test
- Eslint, prettier: formatting & linting
- AWS CDK & SDK: to manage all AWS interactions
- AWS
  - DynamoDB: data storage
  - Lambda: serverless
  - AppSync: for GraphQL APIs
  - CodePipeline: CI/CD
  - Secrete Manager: secure env variable storage

## Project structure

```
├── bin/                  # Entry point for the CDK application
│   └── product-management.ts
├── lib/                  # CDK stack and pipeline configuration
│   ├── product-management-stack.ts
│   └── code-pipeline-setup.ts
├── src/                  # Application source code
│   ├── handlers/         # Lambda function handlers
│   │   ├── createProductHandler.ts
│   │   └── getProductHandler.ts
│   ├── utils/            # Shared utility functions
│   └── schema.graphql    # GraphQL schema for AppSync
├── tests/                # Unit tests for Lambda handlers
├── buildspec.yml         # Build specification for CodeBuild
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Documentation
```

## Clone, run & deploy

### Clone

```bash
   git clone git@github.com:Nikhilnair48/cartify.git
   cd cartify
   npm i
   npm install -g aws-cdk
```

### CDK & AWS setup

```bash
    npm run create-tables # create the DynamoDB tables

    cdk bootstrap
    npm run synth
    npm run deploy
```

## CI/CD Pipeline
The project includes an automated CI/CD pipeline built using AWS CodePipeline. It:

- Pulls source code from GitHub.
- Executes tests using CodeBuild.
- Deploys the application to AWS Lambda & updated any necessary resources.
- Make sure the CodePipeline IAM role has access to:
    - The GitHub repository (via CodeStar connection).
    - S3 for artifact storage.
    - Secrets Manager for fetching environment variables.
