import { readKeyFile } from 'src/domain/useCase/file';
import * as fs from 'fs';
import * as path from 'path';
import { UTF8 } from 'src/config/constants/encode';

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

    expect(path.join).toHaveBeenCalledWith(process.cwd(), relativeFilePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, UTF8);
    expect(result).toBe(mockFileContent);
  });
});
