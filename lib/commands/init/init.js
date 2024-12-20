import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { createDirIfNotExists } from '../../utils/fsHelpers.js';

export function initRepository() {
  const repoDir = path.join(process.cwd(), '.dgit');
  const objectsDir = path.join(repoDir, 'objects');
  const refsDir = path.join(repoDir, 'refs');
  const headFile = path.join(repoDir, 'HEAD');

  if (fs.existsSync(repoDir)) {
    console.log(chalk.red('A dgit repository already exists in this directory.'));
    return;
  }

  try {
    // Create necessary directories
    createDirIfNotExists(repoDir);
    createDirIfNotExists(objectsDir);
    createDirIfNotExists(refsDir);

    // Create the HEAD file with default branch reference
    fs.writeFileSync(headFile, 'ref: refs/heads/main', 'utf-8');

    console.log(chalk.green('Initialized empty dgit repository in ') + chalk.blue(repoDir));
  } catch (err) {
    console.error(chalk.red('Error initializing repository:'), err.message);
  }
}