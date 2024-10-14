import * as fs from 'fs';
import * as path from 'path';
import { UTF8 } from 'src/config/constants';

/**
 * Read private key file
 * @param fileName private key file name
 * @returns private key
 */
export const readKeyFile = (relativeFilePath: string): string => {
  const filePath = path.join(process.cwd(), relativeFilePath);
  return fs.readFileSync(filePath, UTF8);
};
