function authMiddleware(req, res, next)
{
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.API_TOKEN;

    if (!authHeader || !authHeader.startsWith('Bearer '))
    {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== expectedToken)
    {
        return res.status(403).json({ error: 'Forbidden: invalid token' });
    }

    next(); // токен верен, пропускаем запрос
}

module.exports = authMiddleware;