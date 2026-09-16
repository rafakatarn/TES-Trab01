import Ajv from 'ajv';
import { SchemaLoaderService, SchemaNotFoundError, SchemaCorruptedError } from './schema-loader.service';
import { TemplateMatchService } from './template-match.service';
import { ComponentValidationResponse, ComponentValidationError } from '../types';
import { Logger } from '../utils/logger';

const ajv = new Ajv({ allErrors: true, strict: false });

export class ValidationService {
  public static async validate(
    componentPayload: any,
    componentType: string,
    correlationId: string
  ): Promise<ComponentValidationResponse> {
    const timestamp = new Date().toISOString();

    try {
      // 1. Load Schema and Template (Default-Deny inside loader)
      const schema = await SchemaLoaderService.loadSchema(componentType);
      const template = await SchemaLoaderService.loadTemplate(componentType);

      // 2. Perform Schema validation with AJV
      const validateFn = ajv.compile(schema);
      const isSchemaValid = validateFn(componentPayload);

      const errors: ComponentValidationError[] = [];

      if (!isSchemaValid && validateFn.errors) {
        for (const error of validateFn.errors) {
          // Format AJV instancePath (e.g., /parameters/id -> $.parameters.id)
          const baseDotPath = error.instancePath ? error.instancePath.replace(/\//g, '.') : '';
          let path = '$' + baseDotPath;

          let code: 'MISSING_REQUIRED_PARAMETER' | 'INVALID_PARAMETER_TYPE' = 'INVALID_PARAMETER_TYPE';
          let message = error.message || 'Validation failed';

          if (error.keyword === 'required') {
            const missingProp = error.params.missingProperty;
            path = path === '$' ? `$.${missingProp}` : `${path}.${missingProp}`;
            code = 'MISSING_REQUIRED_PARAMETER';
            message = `should have required property '${missingProp}'`;
          } else if (error.keyword === 'type') {
            code = 'INVALID_PARAMETER_TYPE';
          }

          errors.push({ path, code, message });
        }
      }

      // 3. Perform Template validation (User Story 2)
      const templateErrors = TemplateMatchService.compare(componentPayload, template);
      errors.push(...templateErrors);

      const isValid = errors.length === 0;

      return {
        isValid,
        correlationId,
        errors,
        timestamp
      };

    } catch (err: any) {
      // Safe failure "default-deny" mappings
      if (err instanceof SchemaNotFoundError || err.name === 'SchemaNotFoundError') {
        Logger.warn(`Default-deny triggered: Schema/Template not found.`, { error: err.message });
        return {
          isValid: false,
          correlationId,
          errors: [
            {
              path: '$',
              code: 'SCHEMA_NOT_FOUND',
              message: err.message
            }
          ],
          timestamp
        };
      }

      if (err instanceof SchemaCorruptedError || err.name === 'SchemaCorruptedError') {
        Logger.error(`Default-deny triggered: Malformed/corrupted file.`, { error: err.message });
        return {
          isValid: false,
          correlationId,
          errors: [
            {
              path: '$',
              code: 'SCHEMA_CORRUPTED',
              message: err.message
            }
          ],
          timestamp
        };
      }

      // Any other file reading/unexpected server errors
      Logger.error(`Unexpected system error during validation.`, { error: err.message });
      throw err;
    }
  }
}
