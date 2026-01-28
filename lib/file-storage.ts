/**
 * File-based persistent storage for application data
 * Stores data in JSON files on disk to survive application restarts
 */

import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.data');

export class FileStorage {
  private storageDir: string;

  constructor(storageDir: string = STORAGE_DIR) {
    this.storageDir = storageDir;
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir(): void {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return;
    }

    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
        console.log('[FileStorage] Created storage directory:', this.storageDir);
      }
    } catch (error) {
      console.error('[FileStorage] Failed to create storage directory:', error);
    }
  }

  /**
   * Save data to a file
   */
  async save<T>(filename: string, data: T): Promise<void> {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return;
    }

    try {
      const filePath = path.join(this.storageDir, filename);
      const tempPath = filePath + '.tmp';

      // Write to temp file first (atomic write)
      await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');

      // Rename to actual file (atomic operation)
      await fs.promises.rename(tempPath, filePath);

      console.log(`[FileStorage] Saved ${filename}`);
    } catch (error) {
      console.error(`[FileStorage] Failed to save ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Load data from a file
   */
  async load<T>(filename: string): Promise<T | null> {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return null;
    }

    try {
      const filePath = path.join(this.storageDir, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`[FileStorage] File not found: ${filename}`);
        return null;
      }

      const content = await fs.promises.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);

      console.log(`[FileStorage] Loaded ${filename}`);
      return data;
    } catch (error) {
      console.error(`[FileStorage] Failed to load ${filename}:`, error);
      return null;
    }
  }

  /**
   * Delete a file
   */
  async delete(filename: string): Promise<void> {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return;
    }

    try {
      const filePath = path.join(this.storageDir, filename);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log(`[FileStorage] Deleted ${filename}`);
      }
    } catch (error) {
      console.error(`[FileStorage] Failed to delete ${filename}:`, error);
    }
  }

  /**
   * Check if file exists
   */
  exists(filename: string): boolean {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return false;
    }

    try {
      const filePath = path.join(this.storageDir, filename);
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }

  /**
   * List all files in storage directory
   */
  async listFiles(): Promise<string[]> {
    if (typeof window !== 'undefined') {
      // Running in browser, skip
      return [];
    }

    try {
      const files = await fs.promises.readdir(this.storageDir);
      return files.filter(f => f.endsWith('.json') && !f.endsWith('.tmp'));
    } catch (error) {
      console.error('[FileStorage] Failed to list files:', error);
      return [];
    }
  }
}

// Singleton instance
const fileStorage = new FileStorage();

export default fileStorage;
