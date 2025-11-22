import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../services/notification.service';
import {
  AppError,
  BusinessError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  TimeoutError,
  ServerError,
  ConflictError,
  BadRequestError
} from '../errors/custom-errors';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor(private injector: Injector) {}

  handleError(error: Error | HttpErrorResponse | any): void {
    const notificationService = this.injector.get(NotificationService);

    console.error('Error global capturado:', error);

    if (error instanceof AppError) {
      this.handleAppError(error, notificationService);
    } else if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error, notificationService);
    } else {
      this.handleUnknownError(error, notificationService);
    }

    this.logErrorToService(error);
  }

  private handleAppError(error: AppError, notificationService: NotificationService): void {
    if (error instanceof BusinessError) {
      notificationService.warning(error.message, 'Error de negocio');
    } 
    else if (error instanceof ValidationError) {
      if (Object.keys(error.errors).length > 0) {
        notificationService.validationError(error.errors, 'Errores de validación');
      } else {
        notificationService.error(error.message, 'Error de validación');
      }
    } 
    else if (error instanceof NotFoundError) {
      notificationService.notFound(error.resourceType, error.resourceId);
    } 
    else if (error instanceof AuthenticationError) {
      notificationService.authenticationRequired();
    } 
    else if (error instanceof AuthorizationError) {
      notificationService.unauthorized();
    } 
    else if (error instanceof NetworkError) {
      notificationService.networkError();
    } 
    else if (error instanceof TimeoutError) {
      notificationService.timeout();
    } 
    else if (error instanceof ServerError) {
      notificationService.serverError();
    } 
    else if (error instanceof ConflictError) {
      notificationService.conflict(error.message);
    } 
    else if (error instanceof BadRequestError) {
      notificationService.error(error.message, 'Solicitud inválida');
    } 
    else {
      notificationService.error(error.message, 'Error');
    }
  }

  private handleHttpError(error: HttpErrorResponse, notificationService: NotificationService): void {
    let errorMessage = 'Ha ocurrido un error en la comunicación con el servidor';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || errorMessage;
    }

    notificationService.error(errorMessage, `Error ${error.status || ''}`);
  }
  private handleUnknownError(error: any, notificationService: NotificationService): void {
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      errorDetails = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (!this.isProduction()) {
      console.error('Detalles del error:', errorDetails);
      notificationService.error(
        `${errorMessage}\n\nRevise la consola para más detalles.`,
        'Error de la aplicación'
      );
    } else {
      notificationService.error(
        'Ha ocurrido un error inesperado. Por favor, intente nuevamente o contacte al soporte.',
        'Error'
      );
    }
  }

  private logErrorToService(error: any): void {
    if (!this.isProduction()) {
      console.group('Error Log Details');
      console.error('Error:', error);
      console.error('Timestamp:', new Date().toISOString());
      console.error('User Agent:', navigator.userAgent);
      console.error('URL:', window.location.href);
      
      if (error instanceof Error) {
        console.error('Stack:', error.stack);
      }
      
      if (error instanceof AppError) {
        console.error('Status Code:', error.statusCode);
        console.error('Error Type:', error.name);
      }
      
      console.groupEnd();
    }
  }

  private isProduction(): boolean {
    return false; 
  }
}