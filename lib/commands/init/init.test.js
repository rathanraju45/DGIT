import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { jest } from '@jest/globals';
import { initRepository } from './init';

describe('initRepository', () => {
  afterEach(() => {
    // Cleanup: Remove the .dgit directory
    if (fs.existsSync('.dgit')) {
      fs.rmSync('.dgit', { recursive: true, force: true });
    }
  });

  test('should initialize a dgit repository in the current working directory', () => {
    // Ensure the current directory is empty and doesn't contain existing .dgit
    if (fs.existsSync('.dgit')) {
      fs.rmSync('.dgit', { recursive: true, force: true });
    }

    // Capture console output
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Run the init command
    initRepository();

    // Verify the .dgit structure
    expect(fs.existsSync('.dgit')).toBe(true);
    expect(fs.existsSync(path.join('.dgit', 'objects'))).toBe(true);
    expect(fs.existsSync(path.join('.dgit', 'refs'))).toBe(true);
    expect(fs.existsSync(path.join('.dgit', 'HEAD'))).toBe(true);

    consoleLogMock.mockRestore();
  });
});
