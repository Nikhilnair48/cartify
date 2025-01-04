import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let cachedSecrets: Record<string, string> = {};

export const getSecrets = async (secretId: string): Promise<Record<string, string>> => {
  if (cachedSecrets) return cachedSecrets;

  const secretsClient = new SecretsManagerClient({});
  const command = new GetSecretValueCommand({ SecretId: secretId });

  try {
    const response = await secretsClient.send(command);
    cachedSecrets = JSON.parse(response.SecretString || '{}');
    return cachedSecrets;
  } catch (error) {
    console.error(`Failed to retrieve secrets from Secrets Manager: ${error}`);
    throw new Error('SecretsManagerError');
  }
};
