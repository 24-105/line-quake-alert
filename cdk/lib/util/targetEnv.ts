export type TargetEnv = 'production';

export const targetEnv = (): TargetEnv => {
  const nodeEnv = process.env.NODE_ENV;
  switch (nodeEnv) {
    case 'prd':
      return 'production';
    default:
      throw new Error(
        `Cannot execute cdk command with the environment variable: ${nodeEnv}`,
      );
  }
};
