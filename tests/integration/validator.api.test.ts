import request from 'supertest';
import app from '../../src/app';
import { SchemaLoaderService } from '../../src/services/schema-loader.service';

jest.mock('../../src/services/schema-loader.service');

describe('POST /api/v1/validate', () => {
  const mockLoadSchema = SchemaLoaderService.loadSchema as jest.MockedFunction<typeof SchemaLoaderService.loadSchema>;
  const mockLoadTemplate = SchemaLoaderService.loadTemplate as jest.MockedFunction<typeof SchemaLoaderService.loadTemplate>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully validate a valid payload against the schema and template', async () => {
    const mockSchema = {
      type: 'object',
      required: ['parameters'],
      properties: {
        parameters: {
          type: 'object',
          required: ['id', 'status'],
          properties: {
            id: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    };
    const mockTemplate = {
      formatVersion: '1.0.0',
      category: 'clinical-device'
    };

    mockLoadSchema.mockResolvedValueOnce(mockSchema);
    mockLoadTemplate.mockResolvedValueOnce(mockTemplate);

    const validBody = {
      componentType: 'quiz',
      componentPayload: {
        formatVersion: '1.0.0',
        category: 'clinical-device',
        parameters: {
          id: 'quiz-1',
          status: 'active'
        }
      }
    };

    const response = await request(app)
      .post('/api/v1/validate')
      .send(validBody);

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(true);
    expect(response.body.errors).toHaveLength(0);
    expect(response.body.correlationId).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  it('should fail with missing required parameter error', async () => {
    const mockSchema = {
      type: 'object',
      required: ['parameters'],
      properties: {
        parameters: {
          type: 'object',
          required: ['id', 'status'],
          properties: {
            id: { type: 'string' },
            status: { type: 'string' }
          }
        }
      }
    };
    const mockTemplate = {}; // No pre-filled template checks for this test

    mockLoadSchema.mockResolvedValueOnce(mockSchema);
    mockLoadTemplate.mockResolvedValueOnce(mockTemplate);

    const invalidBody = {
      componentType: 'quiz',
      componentPayload: {
        parameters: {
          id: 'quiz-1'
          // status is missing
        }
      }
    };

    const response = await request(app)
      .post('/api/v1/validate')
      .send(invalidBody);

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('status'),
          code: 'MISSING_REQUIRED_PARAMETER'
        })
      ])
    );
  });

  it('should fail with invalid parameter type error', async () => {
    const mockSchema = {
      type: 'object',
      required: ['parameters'],
      properties: {
        parameters: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    };
    const mockTemplate = {};

    mockLoadSchema.mockResolvedValueOnce(mockSchema);
    mockLoadTemplate.mockResolvedValueOnce(mockTemplate);

    const invalidBody = {
      componentType: 'quiz',
      componentPayload: {
        parameters: {
          id: 12345 // Number instead of string
        }
      }
    };

    const response = await request(app)
      .post('/api/v1/validate')
      .send(invalidBody);

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('id'),
          code: 'INVALID_PARAMETER_TYPE'
        })
      ])
    );
  });

  it('should return SCHEMA_NOT_FOUND if the requested schema does not exist', async () => {
    const error = new Error('Schema file not found');
    (error as any).name = 'SchemaNotFoundError';
    mockLoadSchema.mockRejectedValueOnce(error);

    const body = {
      componentType: 'nonexistent-type',
      componentPayload: {
        id: 'quiz-1'
      }
    };

    const response = await request(app)
      .post('/api/v1/validate')
      .send(body);

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(false);
    expect(response.body.errors).toEqual([
      expect.objectContaining({
        code: 'SCHEMA_NOT_FOUND',
        message: expect.any(String)
      })
    ]);
  });

  it('should fail if template pre-filled mismatch is detected', async () => {
    const mockSchema = {
      type: 'object',
      required: ['parameters'],
      properties: {
        parameters: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' }
          }
        }
      }
    };
    const mockTemplate = {
      formatVersion: '1.0.0',
      category: 'clinical-device'
    };

    mockLoadSchema.mockResolvedValueOnce(mockSchema);
    mockLoadTemplate.mockResolvedValueOnce(mockTemplate);

    const invalidBody = {
      componentType: 'quiz',
      componentPayload: {
        formatVersion: '2.0.0', // mismatched!
        category: 'clinical-device',
        parameters: {
          id: 'quiz-1'
        }
      }
    };

    const response = await request(app)
      .post('/api/v1/validate')
      .send(invalidBody);

    expect(response.status).toBe(200);
    expect(response.body.isValid).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '$.formatVersion',
          code: 'PREFILLED_FIELD_MISMATCH'
        })
      ])
    );
  });
});
