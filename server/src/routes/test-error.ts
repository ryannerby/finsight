import { Router } from 'express';

const router = Router();

// Test route that throws an error
router.get('/throw', (req, res, next) => {
  const error = new Error('Test error for error handling middleware');
  (error as any).status = 500;
  next(error);
});

// Test route that throws a validation error
router.get('/validation', (req, res, next) => {
  const error = new Error('Validation failed');
  (error as any).status = 422;
  (error as any).name = 'ValidationError';
  next(error);
});

export { router as testErrorRouter };
