const { ValidationError } = require('../index');

describe('ValidationError', () =>
{
    test('создаётся с правильными свойствами', () => {
        const error = new ValidationError('field', 'badValue', 'Message');
        expect(error.name).toBe('ValidationError');
        expect(error.field).toBe('field');
        expect(error.invalidValue).toBe('badValue');  // исправлено с 'invalidValue' на 'badValue'
        expect(error.message).toContain('Message');
    });

    test('выбрасывается при валидации', () => {
        expect(() => {
            throw new ValidationError('test', 123, 'Error');
        }).toThrow(ValidationError);
    });
});