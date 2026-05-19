class AppError extends Error
{
    constructor(message, options = {})
    {
        super(message);

        this.name = this.constructor.name;
        this.timestamp = new Date().toISOString();
        this.context = options.context || null;
        this.code = options.code || 'APP_ERROR';

        if (Error.captureStackTrace)
        {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON()
    {
        return {
            name: this.name,
            message: this.message,
            timestamp: this.timestamp,
            context: this.context,
            code: this.code,
            stack: this.stack
        };
    }
}

module.exports = AppError;