/**
 * GUÍA DE USO DEL SISTEMA DE MANEJO DE ERRORES
 * 
 * Este archivo contiene ejemplos de cómo usar correctamente el sistema de errores
 * implementado en la aplicación.
 */

import { Component, inject } from '@angular/core';
import { HarvestService } from '../core/services/harvest.service';
import { NotificationService } from '../core/services/notification.service';
import {
  BusinessError,
  ValidationError,
  NotFoundError,
  ConflictError
} from '../core/errors/custom-errors';

// Interfaces para tipado
interface Seller {
  dni: string;
  name: string;
  email: string;
}

interface FormData {
  name?: string;
  email?: string;
  age?: number;
}

@Component({
  selector: 'app-example-usage',
  standalone: true,
  template: ''
})
export class ExampleUsageComponent {
  private harvestService = inject(HarvestService);
  private notificationService = inject(NotificationService);

  /**
   * EJEMPLO 1: Manejo básico de errores en peticiones HTTP
   * Los errores HTTP son capturados automáticamente por el interceptor
   */
  loadHarvests() {
    this.harvestService.findAll().subscribe({
      next: (data) => {
        console.log('Cosechas cargadas:', data);
        // El interceptor NO muestra notificaciones de éxito
        // Debes hacerlo manualmente si lo necesitas
        this.notificationService.success('Cosechas cargadas exitosamente');
      },
      error: (error: Error) => {
        // El error ya fue procesado por el interceptor
        // Aquí puedes agregar lógica adicional si es necesario
        console.error('Error capturado en el componente:', error);
      }
    });
  }

  /**
   * EJEMPLO 2: Lanzar errores de negocio personalizados
   */
  validateBusinessRules(quantity: number) {
    if (quantity < 0) {
      // Lanzar error de negocio
      throw new BusinessError('La cantidad no puede ser negativa');
    }

    if (quantity > 1000) {
      throw new BusinessError('La cantidad excede el límite permitido de 1000 unidades');
    }
  }

  /**
   * EJEMPLO 3: Validación con múltiples errores
   */
  validateForm(formData: FormData) {
    const errors: { [key: string]: string[] } = {};

    if (!formData.name) {
      errors['name'] = ['El nombre es requerido'];
    }

    if (!formData.email) {
      errors['email'] = ['El email es requerido'];
    } else if (!this.isValidEmail(formData.email)) {
      errors['email'] = ['El email no tiene un formato válido'];
    }

    if (formData.age && formData.age < 18) {
      errors['age'] = ['Debe ser mayor de 18 años'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Los datos del formulario no son válidos', errors);
    }
  }

  /**
   * EJEMPLO 4: Buscar un recurso y manejar cuando no existe
   */
  findHarvestById(id: number) {
    this.harvestService.findById(id).subscribe({
      next: (harvest) => {
        console.log('Cosecha encontrada:', harvest);
      },
      error: (error: Error) => {
        // El interceptor automáticamente convierte errores 404 a NotFoundError
        // y muestra la notificación correspondiente
        if (error instanceof NotFoundError) {
          // Aquí puedes agregar lógica adicional
          console.log('Redirigiendo a la lista de cosechas...');
        }
      }
    });
  }

  /**
   * EJEMPLO 5: Manejar conflictos (recurso ya existe)
   * NOTA: Este ejemplo asume que tendrías un SellerService con método findByDni
   * Para propósitos de demostración, se muestra la estructura correcta
   */
  saveSeller(seller: Seller) {
    // Ejemplo conceptual - en la práctica necesitarías un SellerService
    // con un método findByDni que retorne Observable<Seller>
    
    // this.sellerService.findByDni(seller.dni).subscribe({
    //   next: (_existingSeller: Seller) => {
    //     // Si encuentra un vendedor con ese DNI, lanzar error de conflicto
    //     throw new ConflictError(
    //       `Ya existe un vendedor con el DNI ${seller.dni}`,
    //       'dni'
    //     );
    //   },
    //   error: (error: Error) => {
    //     if (error instanceof NotFoundError) {
    //       // DNI no existe, proceder a guardar
    //       this.proceedToSave(seller);
    //     } else {
    //       // Otro tipo de error
    //       console.error('Error al verificar DNI:', error);
    //     }
    //   }
    // });

    // Alternativa sin servicio: validación directa
    this.checkSellerExists(seller.dni).then(exists => {
      if (exists) {
        throw new ConflictError(
          `Ya existe un vendedor con el DNI ${seller.dni}`,
          'dni'
        );
      }
      this.proceedToSave(seller);
    });
  }

  /**
   * EJEMPLO 6: Usar notificaciones manuales
   */
  showNotifications() {
    // Notificación de éxito
    this.notificationService.success('Operación completada exitosamente');

    // Notificación de error
    this.notificationService.error('Ha ocurrido un error', 'Error');

    // Notificación de advertencia
    this.notificationService.warning('Verifique los datos ingresados');

    // Notificación informativa
    this.notificationService.info('Recuerde guardar sus cambios');

    // Toast (notificación pequeña)
    this.notificationService.toast('Cambios guardados', 'success');
  }

  /**
   * EJEMPLO 7: Confirmación antes de una acción
   */
  deleteHarvest(id: number) {
    this.notificationService.confirm({
      title: '¿Está seguro?',
      message: 'Esta acción no se puede deshacer',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.harvestService.delete(id).subscribe({
          next: () => {
            this.notificationService.success('Cosecha eliminada exitosamente');
          },
          error: (error: Error) => {
            // El error ya fue manejado por el interceptor
            console.error('Error al eliminar:', error);
          }
        });
      }
    });
  }

  /**
   * EJEMPLO 8: Mostrar loading mientras se procesa
   */
  async processLargeOperation() {
    // Mostrar loading
    this.notificationService.loading('Procesando datos, por favor espere...');

    try {
      // Simular operación larga
      await this.someAsyncOperation();

      // Cerrar loading
      this.notificationService.close();

      // Mostrar éxito
      this.notificationService.success('Operación completada');
    } catch (error) {
      // Cerrar loading
      this.notificationService.close();
      
      // El error será manejado por el global error handler
      throw error;
    }
  }

  /**
   * EJEMPLO 9: Manejo de errores en operaciones síncronas
   */
  processData(data: { quantity: number } & FormData) {
    try {
      // Validaciones
      this.validateBusinessRules(data.quantity);
      this.validateForm(data);

      // Procesamiento
      console.log('Datos válidos, procesando...');

    } catch (error) {
      // El error será capturado por el global error handler
      // y se mostrará la notificación apropiada
      throw error;
    }
  }

  /**
   * EJEMPLO 10: Errores personalizados con contexto adicional
   */
  checkInventory(productId: number, requestedQuantity: number) {
    const availableQuantity = 50; // Simular consulta a inventario

    if (requestedQuantity > availableQuantity) {
      throw new BusinessError(
        `Cantidad solicitada (${requestedQuantity}) excede el inventario disponible (${availableQuantity})`
      );
    }
  }

  // Métodos auxiliares
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private proceedToSave(seller: Seller): void {
    console.log('Guardando vendedor:', seller);
    // Aquí iría la lógica real de guardado
  }

  private async someAsyncOperation(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 2000);
    });
  }

  private async checkSellerExists(dni: string): Promise<boolean> {
    // Simular verificación - en producción consultarías un servicio
    return Promise.resolve(false);
  }
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. El HttpErrorInterceptor captura automáticamente todos los errores de peticiones HTTP
 *    y los convierte en errores personalizados apropiados.
 * 
 * 2. El GlobalErrorHandler captura todos los errores no manejados en la aplicación
 *    (incluyendo errores síncronos) y muestra notificaciones apropiadas.
 * 
 * 3. Los errores HTTP se reintentan automáticamente una vez si son errores de red (status 0).
 * 
 * 4. Todas las peticiones tienen un timeout de 30 segundos por defecto.
 * 
 * 5. No es necesario usar alert() nunca más, usa el NotificationService.
 * 
 * 6. Los errores de validación pueden incluir múltiples campos con múltiples mensajes.
 * 
 * 7. En producción, los errores se pueden enviar a servicios de logging externos
 *    (configurable en GlobalErrorHandler).
 * 
 * 8. Todos los componentes de notificación usan SweetAlert2 con estilos personalizados
 *    que coinciden con el diseño de tu aplicación.
 * 
 * 9. IMPORTANTE: El Ejemplo 5 está comentado porque requiere un SellerService que no
 *    existe en el proyecto. Se proporciona una alternativa funcional.
 */