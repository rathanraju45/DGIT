import fs from 'fs';
import path from 'path';
import { addFiles } from './add';
import { initRepository } from '../init/init';

describe('addFiles', () => {
  const repoPath = path.resolve('./test-repo');

  beforeAll(() => {
    if (!fs.existsSync(repoPath)) fs.mkdirSync(repoPath);
    process.chdir(repoPath);
    initRepository();
  });

  beforeEach(() => {
    // Clean the test-repo directory
    const files = fs.readdirSync(repoPath);
    files.forEach((file) => {
      if (file !== '.dgit') {
        const fullPath = path.join(repoPath, file);
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    });
  });

  afterEach(() => {
    if (fs.existsSync('.dgit/index')) {
      fs.unlinkSync('.dgit/index');
    }
  });

  afterAll(() => {
    // Clean up the test-repo directory
    process.chdir('..');
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
    }
  });

  test('should add a single file to the index', () => {
    const fileName = 'test-file.txt';
    fs.writeFileSync(fileName, 'Hello, dgit!');
    addFiles(fileName);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    expect(indexContent).toContain(path.resolve(fileName));
  });

  test('should add multiple files to the index', () => {
    const fileNames = ['file1.txt', 'file2.txt'];
    fileNames.forEach(fileName => fs.writeFileSync(fileName, 'Hello, dgit!'));
    addFiles(fileNames);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    fileNames.forEach(fileName => {
      expect(indexContent).toContain(path.resolve(fileName));
    });
  });

  test('should add all files in a directory to the index', () => {
    const dirName = 'test-dir';
    fs.mkdirSync(dirName);
    const fileNames = ['file1.txt', 'file2.txt'];
    fileNames.forEach(fileName => fs.writeFileSync(path.join(dirName, fileName), 'Hello, dgit!'));
    addFiles(dirName);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    fileNames.forEach(fileName => {
      expect(indexContent).toContain(path.resolve(path.join(dirName, fileName)));
    });
  });

  test('should handle non-existent files gracefully', () => {
    const nonExistentFile = 'non-existent.txt';
    expect(() => addFiles(nonExistentFile)).toThrow(`File or directory ${nonExistentFile} does not exist`);
  });

  test('should ignore files matching patterns in .dgitignore', () => {
    const ignoredFile = 'ignored-file.txt';
    fs.writeFileSync(ignoredFile, 'This file should be ignored');
    fs.writeFileSync('.dgitignore', 'ignored-file.txt');
    addFiles(ignoredFile);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    expect(indexContent).not.toContain(path.resolve(ignoredFile));
  });

  test('should add a mix of files and directories to the index', () => {
    const dirName = 'test-dir';
    fs.mkdirSync(dirName);
    const fileNames = ['file1.txt', 'file2.txt', path.join(dirName, 'file3.txt')];
    fileNames.forEach(fileName => fs.writeFileSync(fileName, 'Hello, dgit!'));
    addFiles(fileNames);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    fileNames.forEach(fileName => {
      expect(indexContent).toContain(path.resolve(fileName));
    });
  });

  test('should add nested directories to the index', () => {
    const dirName = 'test-dir';
    const nestedDirName = path.join(dirName, 'nested-dir');
    fs.mkdirSync(dirName);
    fs.mkdirSync(nestedDirName);
    const fileNames = [path.join(dirName, 'file1.txt'), path.join(nestedDirName, 'file2.txt')];
    fileNames.forEach(fileName => fs.writeFileSync(fileName, 'Hello, dgit!'));
    addFiles(dirName);
    const indexContent = JSON.parse(fs.readFileSync('.dgit/index', 'utf-8'));
    fileNames.forEach(fileName => {
      expect(indexContent).toContain(path.resolve(fileName));
    });
  });
});