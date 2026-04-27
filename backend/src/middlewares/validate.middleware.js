export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return next(Object.assign(new Error('Invalid request body'), { statusCode: 400, details: parsed.error.flatten() }));
    }

    req.body = parsed.data;
    return next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.query);

    if (!parsed.success) {
      return next(Object.assign(new Error('Invalid request query'), { statusCode: 400, details: parsed.error.flatten() }));
    }

    req.query = parsed.data;
    return next();
  };
}

