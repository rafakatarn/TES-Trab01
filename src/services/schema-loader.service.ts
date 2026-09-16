import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../utils/logger';

export class SchemaNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaNotFoundError';
  }
}

export class SchemaCorruptedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaCorruptedError';
  }
}

export class SchemaLoaderService {
  public static getSchemasDir(): string {
    return path.resolve(process.env.SCHEMAS_DIR || 'src/schemas');
  }

  /**
   * Sanitizes and validates the component type to prevent directory traversal attacks.
   */
  public static sanitizeComponentType(componentType: string): string {
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validPattern.test(componentType)) {
      Logger.warn(`Potential traversal attack blocked or invalid type: "${componentType}"`);
      throw new SchemaNotFoundError(`Invalid component type pattern.`);
    }
    return componentType;
  }

  public static async loadSchema(componentType: string): Promise<Record<string, any>> {
    const sanitized = this.sanitizeComponentType(componentType);
    const dir = this.getSchemasDir();
    const filePath = path.join(dir, `${sanitized}.schema.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        Logger.warn(`Schema file not found for type "${sanitized}" at ${filePath}`);
        throw new SchemaNotFoundError(`Schema not found for type ${sanitized}.`);
      }
      if (err instanceof SyntaxError) {
        Logger.error(`Schema JSON corruption detected for type "${sanitized}"`, { error: err.message });
        throw new SchemaCorruptedError(`Schema for ${sanitized} is malformed or corrupted.`);
      }
      throw err;
    }
  }

  public static async loadTemplate(componentType: string): Promise<Record<string, any>> {
    const sanitized = this.sanitizeComponentType(componentType);
    const dir = this.getSchemasDir();
    const filePath = path.join(dir, `${sanitized}.template.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        Logger.warn(`Template file not found for type "${sanitized}" at ${filePath}`);
        throw new SchemaNotFoundError(`Template not found for type ${sanitized}.`);
      }
      if (err instanceof SyntaxError) {
        Logger.error(`Template JSON corruption detected for type "${sanitized}"`, { error: err.message });
        throw new SchemaCorruptedError(`Template for ${sanitized} is malformed or corrupted.`);
      }
      throw err;
    }
  }
}
