import { ComponentValidationError } from '../types';

export class TemplateMatchService {
  public static compare(
    payload: any,
    template: any,
    path = '$',
    dotPath = ''
  ): ComponentValidationError[] {
    const errors: ComponentValidationError[] = [];

    if (!template || typeof template !== 'object') {
      return errors;
    }

    for (const key of Object.keys(template)) {
      const templateValue = template[key];
      const payloadValue = payload ? payload[key] : undefined;

      const currentPath = `${path}.${key}`;
      const currentDotPath = dotPath ? `${dotPath}.${key}` : key;

      if (templateValue !== null && typeof templateValue === 'object') {
        if (payloadValue === null || typeof payloadValue !== 'object') {
          errors.push({
            path: currentPath,
            code: 'PREFILLED_FIELD_MISMATCH',
            message: `Template mismatch: expected value for '${currentDotPath}' to be 'object', but got '${payloadValue === null ? 'null' : typeof payloadValue}'.`
          });
        } else {
          const nestedErrors = this.compare(payloadValue, templateValue, currentPath, currentDotPath);
          errors.push(...nestedErrors);
        }
      } else {
        if (payloadValue !== templateValue) {
          errors.push({
            path: currentPath,
            code: 'PREFILLED_FIELD_MISMATCH',
            message: `Template mismatch: expected value for '${currentDotPath}' to be '${templateValue}', but got '${payloadValue}'.`
          });
        }
      }
    }

    return errors;
  }
}
