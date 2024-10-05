import * as fs from 'fs';
import * as path from 'path';

/**
 * Read private key file.
 * @param fileName private key file name
 * @returns private key
 */
export const readKeyFile = (relativeFilePath: string): string => {
  const filePath = path.join(process.cwd(), relativeFilePath);
  return fs.readFileSync(filePath, 'utf8');
};
