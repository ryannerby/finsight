import { Logger } from '../lib/logger';

declare global {
  namespace Express {
    interface Request {
      logger: Logger;
    }
  }
}

export {};
