declare global {
  interface ErrorConstructor {
    captureStackTrace?(target: object, constructor?: Function): void;
  }
}

export abstract class AppError extends Error {
  public readonly timestamp: Date;
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.statusCode = statusCode;
    
    Object.setPrototypeOf(this, new.target.prototype);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends AppError {
  public readonly errors: { [key: string]: string[] };

  constructor(message: string, errors: { [key: string]: string[] } = {}) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  public readonly resourceType: string;
  public readonly resourceId?: string | number;

  constructor(resourceType: string, resourceId?: string | number) {
    const message = resourceId 
      ? `${resourceType} con ID ${resourceId} no encontrado`
      : `${resourceType} no encontrado`;
    super(message, 404);
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autenticado. Por favor inicie sesión.') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  public readonly requiredPermission?: string;

  constructor(message: string = 'No tiene permisos para realizar esta acción', requiredPermission?: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
    this.requiredPermission = requiredPermission;
  }
}

export class NetworkError extends AppError {
  public readonly originalError?: any;

  constructor(message: string = 'Error de conexión. Verifique su conexión a internet.', originalError?: any) {
    super(message, 0);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'La solicitud ha excedido el tiempo de espera') {
    super(message, 408);
    this.name = 'TimeoutError';
  }
}

export class ServerError extends AppError {
  public readonly originalError?: any;

  constructor(message: string = 'Error interno del servidor', statusCode: number = 500, originalError?: any) {
    super(message, statusCode);
    this.name = 'ServerError';
    this.originalError = originalError;
  }
}

export class ConflictError extends AppError {
  public readonly conflictingField?: string;

  constructor(message: string, conflictingField?: string) {
    super(message, 409);
    this.name = 'ConflictError';
    this.conflictingField = conflictingField;
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud inválida') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}