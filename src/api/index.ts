import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationChain, header, validationResult } from 'express-validator';

export const logError = (code: number, req: Request, message: string) =>
  console.error(`Error: ${code} ${message} ${JSON.stringify({
    body: req.body,
    headers: req.headers,
    params: req.params,
    query: req.query,
  })}`);

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logError(500, req, err.message);
  res.status(500).send({ reason: 'server', message: err.message });
};

export const withApiKey = (): RequestHandler =>
  async (req, res, next) => {
    await header('X-API-KEY')
      .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      .run(req);

    const result = validationResult(req);
    if (!result.isEmpty()) {
      const message = 'API Key is missing or invalid.';
      logError(401, req, message);
      return res.status(401).json({ reason: 'unauthorized', message: message });
    }

    res.locals.apiKey = req.header('X-API-KEY');

    return next();
  };

export const validate = (validations: ValidationChain[]): RequestHandler =>
  async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const result = validationResult(req);
    if (!result.isEmpty()) {
      const message = 'Request validation failed.';
      logError(400, req, message);
      return res.status(400).json({ reason: 'validation', message: message, errors: result.array() });
    }

    return next();
  };
