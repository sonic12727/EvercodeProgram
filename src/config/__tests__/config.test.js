const { config, validateConfig } = require('../config');
const { ValidationError } = require('../../errors');

describe('validateConfig', () =>
{
    test('проходит при валидных настройках', () =>
    {
        expect(() => validateConfig(config)).not.toThrow();
    });

    test('выбрасывает ValidationError при невалидном interval', () =>
    {
        const badConfig =
        {
            ...config,
            settings: { ...config.settings, schedulerIntervalMs: 'not-a-number' }
        };
        expect(() => validateConfig(badConfig)).toThrow(ValidationError);
    });
});