const { ValidationError } = require('../errors');

const config =
{
    appName: 'Career Program Scheduler',
    settings:
    {
        environment: 'development',
        schedulerIntervalMs: 10000,
        timezone: 'Europe/Berlin'
    }
};

function validateConfig(config)
{
    const { settings } = config;

    if (typeof settings.schedulerIntervalMs !== 'number' || settings.schedulerIntervalMs < 1000)
    {
        throw new ValidationError(
            'schedulerIntervalMs',
            settings.schedulerIntervalMs,
            'schedulerIntervalMs must be a number >= 1000 (1 second)'
        );
    }

    if (typeof settings.timezone !== 'string' || settings.timezone.trim() === '')
    {
        throw new ValidationError(
            'timezone',
            settings.timezone,
            'timezone must be a non-empty string (e.g., "Europe/Berlin")'
        );
    }

    const validEnvironments = ['development', 'test', 'production'];
    if (!validEnvironments.includes(settings.environment))
    {
        throw new ValidationError(
            'environment',
            settings.environment,
            `environment must be one of: ${validEnvironments.join(', ')}`
        );
    }

    return true;
}

module.exports =
{
    config,
    validateConfig
};
