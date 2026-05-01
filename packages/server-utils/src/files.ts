import fs from 'node:fs';
import fse from 'fs-extra';
import winston from 'winston';

export function removeDirectoryIfExists(directoryPath: string) {
  try {
    fs.rmSync(directoryPath, { recursive: true, force: true });
    winston.info(`Successfully removed directory: ${directoryPath}`);
  } catch (error) {
    winston.error(`Error removing directory ${directoryPath}:`, error);
  }
}

export function createDirectory(directoryPath: string) {
  try {
    // Check if directory exists before attempting to create
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      winston.info(`Successfully created directory: ${directoryPath}`);
    }
  } catch (error) {
    winston.error(`Error creating directory ${directoryPath}:`, error);
  }
}

export function copyDirectory(sourceDir: string, destinationDir: string) {
  try {
    // Copy entire directory at once
    fse.copySync(sourceDir, destinationDir);
    winston.info('Successfully copied directory');
  } catch (error) {
    winston.error('Error copying directory:', error);
  }
}
