import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import minimatch from 'minimatch';

const INDEX_FILE = '.dgit/index';
const DGITIGNORE_FILE = '.dgitignore';

function ensureIndexFileExists() {
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify([]), 'utf-8');
  }
}

function readDgitignore() {
  if (fs.existsSync(DGITIGNORE_FILE)) {
    const ignoreContent = fs.readFileSync(DGITIGNORE_FILE, 'utf-8');
    return ignoreContent.split('\n').filter(line => line.trim() !== '');
  }
  return [];
}

function isIgnored(filePath, ignorePatterns) {
  return ignorePatterns.some(pattern => minimatch(filePath, pattern));
}

function addFileToIndex(filePath, ignorePatterns, addedFiles, ignoredFiles) {
  const absolutePath = path.resolve(filePath);

  if (isIgnored(absolutePath, ignorePatterns)) {
    ignoredFiles.push(filePath);
    return;
  }

  const stats = fs.statSync(absolutePath);
  if (stats.isDirectory()) {
    console.error(chalk.red(`${filePath} is a directory. Use addFiles to add directories.`));
    return;
  }

  const indexContent = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  if (!indexContent.includes(absolutePath)) {
    indexContent.push(absolutePath);
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexContent), 'utf-8');
    addedFiles.push(filePath);
  }
}

function addDirectoryToIndex(directoryPath, ignorePatterns, addedFiles, ignoredFiles) {
  const files = fs.readdirSync(directoryPath);
  files.forEach(file => {
    const fullPath = path.join(directoryPath, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      addDirectoryToIndex(fullPath, ignorePatterns, addedFiles, ignoredFiles);
    } else {
      addFileToIndex(fullPath, ignorePatterns, addedFiles, ignoredFiles);
    }
  });
}

export function addFiles(filePaths) {
  ensureIndexFileExists();
  const ignorePatterns = readDgitignore();
  const addedFiles = [];
  const ignoredFiles = [];

  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths];
  }

  filePaths.forEach(filePath => {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File or directory ${filePath} does not exist`);
    }

    if (fs.statSync(absolutePath).isDirectory()) {
      addDirectoryToIndex(absolutePath, ignorePatterns, addedFiles, ignoredFiles);
    } else {
      addFileToIndex(absolutePath, ignorePatterns, addedFiles, ignoredFiles);
    }
  });

  console.log(chalk.green(`Added ${addedFiles.length} file(s):`));
  addedFiles.forEach(file => console.log(chalk.green(`  added: ${file}`)));

  if (ignoredFiles.length > 0) {
    console.log(chalk.yellow(`Ignored ${ignoredFiles.length} file(s):`));
    ignoredFiles.forEach(file => console.log(chalk.yellow(`  ignored: ${file}`)));
  }
}