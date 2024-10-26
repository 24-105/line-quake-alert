import { readKeyFile } from 'src/domain/useCase/file';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');

describe('readKeyFile', () => {
  it('should read the private key file correctly', () => {
    const relativeFilePath = 'test/key.pem';
    const mockFilePath = `/mocked/path/${relativeFilePath}`;
    const mockFileContent = 'mocked private key content';

    (path.join as jest.Mock).mockReturnValue(mockFilePath);
    (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

    const result = readKeyFile(relativeFilePath);

    expect(typeof result).toBe('string');
    expect(result).toBe(mockFileContent);
  });
});
