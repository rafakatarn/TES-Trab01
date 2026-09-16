import * as fs from 'fs/promises';
import * as path from 'path';
import { SchemaLoaderService, SchemaNotFoundError, SchemaCorruptedError } from '../../src/services/schema-loader.service';

jest.mock('fs/promises');

describe('SchemaLoaderService', () => {
  const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeComponentType', () => {
    it('should allow valid component type names', () => {
      expect(SchemaLoaderService.sanitizeComponentType('quiz')).toBe('quiz');
      expect(SchemaLoaderService.sanitizeComponentType('clinical-device-123')).toBe('clinical-device-123');
    });

    it('should throw SchemaNotFoundError for invalid patterns (directory traversal)', () => {
      expect(() => SchemaLoaderService.sanitizeComponentType('../etc/passwd')).toThrow(SchemaNotFoundError);
      expect(() => SchemaLoaderService.sanitizeComponentType('quiz/subfolder')).toThrow(SchemaNotFoundError);
      expect(() => SchemaLoaderService.sanitizeComponentType('quiz;rm -rf')).toThrow(SchemaNotFoundError);
    });
  });

  describe('loadSchema', () => {
    it('should successfully load and parse a valid schema', async () => {
      const mockSchema = { type: 'object', required: ['id'] };
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockSchema));

      const result = await SchemaLoaderService.loadSchema('quiz');
      expect(result).toEqual(mockSchema);
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it('should throw SchemaNotFoundError if schema file does not exist', async () => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValueOnce(error);

      await expect(SchemaLoaderService.loadSchema('quiz')).rejects.toThrow(SchemaNotFoundError);
    });

    it('should throw SchemaCorruptedError if schema contains invalid JSON syntax', async () => {
      mockReadFile.mockResolvedValueOnce('{ invalid: json }');

      await expect(SchemaLoaderService.loadSchema('quiz')).rejects.toThrow(SchemaCorruptedError);
    });
  });

  describe('loadTemplate', () => {
    it('should successfully load and parse a valid template', async () => {
      const mockTemplate = { formatVersion: '1.0.0' };
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockTemplate));

      const result = await SchemaLoaderService.loadTemplate('quiz');
      expect(result).toEqual(mockTemplate);
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    it('should throw SchemaNotFoundError if template file does not exist', async () => {
      const error: any = new Error('File not found');
      error.code = 'ENOENT';
      mockReadFile.mockRejectedValueOnce(error);

      await expect(SchemaLoaderService.loadTemplate('quiz')).rejects.toThrow(SchemaNotFoundError);
    });
  });

  describe('getSchemasDir', () => {
    const originalSchemasDir = process.env.SCHEMAS_DIR;

    afterEach(() => {
      process.env.SCHEMAS_DIR = originalSchemasDir;
    });

    it('should default to src/schemas if process.env.SCHEMAS_DIR is not set', () => {
      delete process.env.SCHEMAS_DIR;
      expect(SchemaLoaderService.getSchemasDir()).toContain(path.join('src', 'schemas'));
    });

    it('should use process.env.SCHEMAS_DIR when set', () => {
      process.env.SCHEMAS_DIR = 'custom-folder-path';
      expect(SchemaLoaderService.getSchemasDir()).toContain('custom-folder-path');
    });
  });
});

