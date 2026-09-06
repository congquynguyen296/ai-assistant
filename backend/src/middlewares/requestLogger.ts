import { Request, Response, NextFunction } from 'express';
import { apiLogger, appLogger } from '@/utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      clientIp: req.ip || req.socket.remoteAddress,
      statusCode: res.statusCode,
      responseTimeMs: duration,
      userAgent: req.get('user-agent') || '',
      message: `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    };

    if (res.statusCode >= 400) {
      apiLogger.error(logData);
    } else {
      apiLogger.info(logData);
    }
  });

  next();
};
