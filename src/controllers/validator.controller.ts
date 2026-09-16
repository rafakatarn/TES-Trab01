import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/validation.service';
import { Logger } from '../utils/logger';

export class ValidatorController {
  public static async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const correlationId = res.getHeader('X-Correlation-ID') as string;

    try {
      const { componentType, componentPayload } = req.body;

      // Ensure required input properties are present
      if (!componentType || componentPayload === undefined) {
        Logger.warn('Invalid body structure: missing componentType or componentPayload', { body: req.body });
        res.status(400).json({
          success: false,
          correlationId,
          error: {
            code: 'MALFORMED_JSON_REQUEST',
            message: "Request must contain 'componentType' and 'componentPayload' fields."
          }
        });
        return;
      }

      // Execute validation (handles default-deny and wraps errors internally)
      const result = await ValidationService.validate(componentPayload, componentType, correlationId);

      Logger.info(`Validation execution finished. isValid: ${result.isValid}`);
      res.status(200).json(result);

    } catch (err) {
      next(err); // delegates to Express global handler
    }
  }
}
