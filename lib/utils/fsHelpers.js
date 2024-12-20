import fs from 'fs';

/**
 * Create a directory if it doesn't exist.
 */
export function createDirIfNotExists(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}


/**
 * Write to a file, creating parent directories if needed.
 */
export function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}
