export interface ComponentValidationRequest {
  componentPayload: string | Record<string, any>;
  componentType: string;
  correlationId?: string;
}

export interface ComponentValidationError {
  path: string;
  code: 'MISSING_REQUIRED_PARAMETER' | 'INVALID_PARAMETER_TYPE' | 'PREFILLED_FIELD_MISMATCH' | 'SYNTAX_ERROR' | 'SCHEMA_NOT_FOUND' | 'SCHEMA_CORRUPTED';
  message: string;
}

export interface ComponentValidationResponse {
  isValid: boolean;
  correlationId: string;
  errors: ComponentValidationError[];
  timestamp: string;
}

export interface ComponentSchema {
  componentType: string;
  schemaContent: Record<string, any>;
}

export interface ComponentTemplate {
  componentType: string;
  templateContent: Record<string, any>;
}
