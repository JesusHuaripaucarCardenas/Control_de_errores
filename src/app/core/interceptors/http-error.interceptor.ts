import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import {
  AppError,
  NetworkError,
  TimeoutError,
  ServerError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  ConflictError,
  BadRequestError
} from '../errors/custom-errors';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  
  private readonly REQUEST_TIMEOUT = 30000; 
  private readonly MAX_RETRIES = 1; 

  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      timeout(this.REQUEST_TIMEOUT),
      
      retry({
        count: this.MAX_RETRIES,
        delay: (error) => {
          if (error instanceof HttpErrorResponse && error.status === 0) {
            return timer(1000); 
          }
          throw error;
        }
      }),
      
      catchError((error: any) => {
        const appError = this.handleError(error);
        this.showErrorNotification(appError);
        return throwError(() => appError);
      })
    );
  }

  private handleError(error: any): AppError {
    console.error('Error interceptado:', error);

    if (error.name === 'TimeoutError') {
      return new TimeoutError();
    }

    if (error instanceof HttpErrorResponse) {
      return this.handleHttpError(error);
    }

    return new NetworkError('Error de conexión. Por favor, verifique su conexión a internet.', error);
  }

  private handleHttpError(error: HttpErrorResponse): AppError {
    const errorMessage = this.extractErrorMessage(error);

    switch (error.status) {
      case 0:
        return new NetworkError('No se pudo conectar con el servidor. Verifique su conexión a internet.', error);

      case 400:
        return new BadRequestError(errorMessage || 'Solicitud inválida. Verifique los datos enviados.');

      case 401:
        return new AuthenticationError(errorMessage || 'Sesión expirada. Por favor, inicie sesión nuevamente.');

      case 403:
        return new AuthorizationError(errorMessage || 'No tiene permisos para realizar esta acción.');

      case 404:
        return this.handleNotFoundError(error, errorMessage);

      case 408:
        return new TimeoutError(errorMessage || 'La solicitud ha excedido el tiempo de espera.');

      case 409:
        return new ConflictError(errorMessage || 'El recurso ya existe o hay un conflicto con el estado actual.');

      case 422:
        return this.handleValidationError(error, errorMessage);

      case 500:
        return new ServerError(
          errorMessage || 'Error interno del servidor. Por favor, intente nuevamente más tarde.',
          500,
          error
        );

      case 502:
        return new ServerError('El servidor no está disponible. Por favor, intente más tarde.', 502, error);

      case 503:
        return new ServerError('El servicio no está disponible temporalmente. Por favor, intente más tarde.', 503, error);

      case 504:
        return new TimeoutError('El servidor tardó demasiado en responder. Por favor, intente nuevamente.');

      default:
        if (error.status >= 500) {
          return new ServerError(
            errorMessage || 'Error del servidor. Por favor, intente nuevamente más tarde.',
            error.status,
            error
          );
        }
        
        return new BadRequestError(errorMessage || 'Ha ocurrido un error procesando su solicitud.');
    }
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      if (error.error.message) {
        return error.error.message;
      }
      
      if (error.error.error) {
        return error.error.error;
      }

      if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
        return error.error.errors[0];
      }
    }

    return error.message || 'Ha ocurrido un error desconocido';
  }

  private handleNotFoundError(error: HttpErrorResponse, errorMessage: string): NotFoundError {

    const url = error.url || '';
    const resourceMatch = url.match(/\/([a-zA-Z]+)\/\d+/);
    const resourceType = resourceMatch ? resourceMatch[1] : 'Recurso';
    
    return new NotFoundError(resourceType);
  }

  private handleValidationError(error: HttpErrorResponse, errorMessage: string): ValidationError {
    let validationErrors: { [key: string]: string[] } = {};

    if (error.error && error.error.errors) {
      if (typeof error.error.errors === 'object') {
        validationErrors = error.error.errors;
      }
    }

    return new ValidationError(
      errorMessage || 'Los datos proporcionados no son válidos',
      validationErrors
    );
  }

  private showErrorNotification(error: AppError): void {
    if (error instanceof AuthenticationError) {
      this.notificationService.authenticationRequired();
      return;
    }

    if (error instanceof AuthorizationError) {
      this.notificationService.unauthorized();
      return;
    }

    if (error instanceof ValidationError) {
      if (Object.keys(error.errors).length > 0) {
        this.notificationService.validationError(error.errors);
      } else {
        this.notificationService.error(error.message, 'Error de validación');
      }
      return;
    }

    if (error instanceof NotFoundError) {
      this.notificationService.notFound(error.resourceType, error.resourceId);
      return;
    }

    if (error instanceof ConflictError) {
      this.notificationService.conflict(error.message);
      return;
    }

    if (error instanceof NetworkError) {
      this.notificationService.networkError();
      return;
    }

    if (error instanceof TimeoutError) {
      this.notificationService.timeout();
      return;
    }

    if (error instanceof ServerError) {
      this.notificationService.serverError();
      return;
    }

    this.notificationService.error(error.message);
  }
}