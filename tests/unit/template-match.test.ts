import { TemplateMatchService } from '../../src/services/template-match.service';

describe('TemplateMatchService', () => {
  it('should pass if the payload contains exactly the same fields and values as the template', () => {
    const template = {
      formatVersion: '1.0.0',
      metadata: {
        category: 'clinical-device'
      }
    };
    const payload = {
      formatVersion: '1.0.0',
      metadata: {
        category: 'clinical-device'
      },
      parameters: {
        id: 'quiz-1'
      } // Extra fields are allowed (one-way comparison)
    };

    const errors = TemplateMatchService.compare(payload, template);
    expect(errors).toHaveLength(0);
  });

  it('should return errors if a top-level template field is missing', () => {
    const template = {
      formatVersion: '1.0.0'
    };
    const payload = {
      parameters: {}
    };

    const errors = TemplateMatchService.compare(payload, template);
    expect(errors).toEqual([
      {
        path: '$.formatVersion',
        code: 'PREFILLED_FIELD_MISMATCH',
        message: "Template mismatch: expected value for 'formatVersion' to be '1.0.0', but got 'undefined'."
      }
    ]);
  });

  it('should return errors if a nested template field is missing', () => {
    const template = {
      metadata: {
        category: 'clinical-device'
      }
    };
    const payload = {
      metadata: {}
    };

    const errors = TemplateMatchService.compare(payload, template);
    expect(errors).toEqual([
      {
        path: '$.metadata.category',
        code: 'PREFILLED_FIELD_MISMATCH',
        message: "Template mismatch: expected value for 'metadata.category' to be 'clinical-device', but got 'undefined'."
      }
    ]);
  });

  it('should return errors if a template field has a mismatched value', () => {
    const template = {
      formatVersion: '1.0.0',
      metadata: {
        category: 'clinical-device'
      }
    };
    const payload = {
      formatVersion: '2.0.0',
      metadata: {
        category: 'other-category'
      }
    };

    const errors = TemplateMatchService.compare(payload, template);
    expect(errors).toEqual(
      expect.arrayContaining([
        {
          path: '$.formatVersion',
          code: 'PREFILLED_FIELD_MISMATCH',
          message: "Template mismatch: expected value for 'formatVersion' to be '1.0.0', but got '2.0.0'."
        },
        {
          path: '$.metadata.category',
          code: 'PREFILLED_FIELD_MISMATCH',
          message: "Template mismatch: expected value for 'metadata.category' to be 'clinical-device', but got 'other-category'."
        }
      ])
    );
  });
});
