import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface NotificationOptions {
  title?: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  timer?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  private readonly defaultTimer = 3000;

  constructor() {}

  success(message: string, title: string = '¡Éxito!', timer: number = this.defaultTimer): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: timer,
      showConfirmButton: timer === 0,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button'
      }
    });
  }

  error(message: string, title: string = 'Error', showConfirmButton: boolean = true): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      showConfirmButton: showConfirmButton,
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button'
      }
    });
  }

  warning(message: string, title: string = 'Advertencia'): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showConfirmButton: true,
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button'
      }
    });
  }

  info(message: string, title: string = 'Información', timer: number = this.defaultTimer): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      timer: timer,
      showConfirmButton: timer === 0,
      timerProgressBar: true,
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button'
      }
    });
  }

  confirm(options: NotificationOptions): Promise<any> {
    return Swal.fire({
      icon: 'question',
      title: options.title || '¿Está seguro?',
      text: options.message,
      showCancelButton: options.showCancelButton !== false,
      confirmButtonText: options.confirmButtonText || 'Sí, continuar',
      cancelButtonText: options.cancelButtonText || 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button'
      }
    });
  }

  toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  validationError(errors: { [key: string]: string[] }, title: string = 'Errores de validación'): Promise<any> {
    let errorList = '<ul style="text-align: left; padding-left: 20px;">';
    
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        errors[field].forEach(error => {
          errorList += `<li><strong>${field}:</strong> ${error}</li>`;
        });
      }
    }
    
    errorList += '</ul>';

    return Swal.fire({
      icon: 'error',
      title: title,
      html: errorList,
      showConfirmButton: true,
      confirmButtonText: 'Entendido',
      customClass: {
        popup: 'custom-popup',
        confirmButton: 'custom-confirm-button'
      }
    });
  }

  loading(message: string = 'Cargando...', title?: string): void {
    Swal.fire({
      title: title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  close(): void {
    Swal.close();
  }

  notFound(resourceType: string, resourceId?: string | number): Promise<any> {
    const message = resourceId 
      ? `El ${resourceType} con ID ${resourceId} no fue encontrado`
      : `El ${resourceType} solicitado no fue encontrado`;
    
    return this.error(message, 'Recurso no encontrado');
  }

  networkError(): Promise<any> {
    return this.error(
      'No se pudo conectar con el servidor. Por favor, verifique su conexión a internet e intente nuevamente.',
      'Error de conexión'
    );
  }


  serverError(): Promise<any> {
    return this.error(
      'Ha ocurrido un error en el servidor. Por favor, intente nuevamente más tarde.',
      'Error del servidor'
    );
  }
  authenticationRequired(): Promise<any> {
    return this.warning(
      'Debe iniciar sesión para acceder a este recurso.',
      'Autenticación requerida'
    );
  }

  unauthorized(): Promise<any> {
    return this.error(
      'No tiene permisos suficientes para realizar esta acción.',
      'Acceso denegado'
    );
  }

  conflict(message: string): Promise<any> {
    return this.warning(message, 'Conflicto');
  }

  timeout(): Promise<any> {
    return this.error(
      'La solicitud ha excedido el tiempo de espera. Por favor, intente nuevamente.',
      'Tiempo agotado'
    );
  }
}