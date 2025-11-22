// crear-registros.component.ts - Ejemplo actualizado
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HarvestService } from '../../core/services/harvest.service';
import { NotificationService } from '../../core/services/notification.service';
import { HarvestRequest } from '../../core/interfaces/harvest.interface';
import { ValidationError, BusinessError } from '../../core/errors/custom-errors';

@Component({
  selector: 'app-crear-registros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-registros.html',
  styleUrl: './crear-registros.scss',
})
export class CrearRegistros implements OnInit {
  // Servicios inyectados
  private harvestService = inject(HarvestService);
  private notificationService = inject(NotificationService);

  // Datos del formulario
  nombreFruta = '';
  idSeller = 1; // TODO: Obtener del usuario logueado

  registrosCantidad = [
    { key: '1ra', cantidad: 0 },
    { key: '3ra', cantidad: 0 },
    { key: '5ta', cantidad: 0 },
    { key: 'Madura', cantidad: 0 }
  ];

  registrosPeso = [
    { key: '1ra', peso: 0 },
    { key: '3ra', peso: 0 },
    { key: '5ta', peso: 0 },
    { key: 'Madura', peso: 0 }
  ];

  ngOnInit() { }

  get totalCantidad(): number {
    return this.registrosCantidad.reduce((sum, reg) => sum + (reg.cantidad || 0), 0);
  }

  get totalPeso(): number {
    return this.registrosPeso.reduce((sum, reg) => sum + (reg.peso || 0), 0);
  }

  /**
   * Valida los datos del formulario antes de guardar
   * Lanza errores personalizados si los datos no son válidos
   */
  private validarFormulario(): void {
    const errors: { [key: string]: string[] } = {};

    // Validar nombre de la fruta
    if (!this.nombreFruta.trim()) {
      errors['nombreFruta'] = ['El nombre de la fruta es requerido'];
    } else if (this.nombreFruta.trim().length < 3) {
      errors['nombreFruta'] = ['El nombre debe tener al menos 3 caracteres'];
    }

    // Validar cantidad total
    if (this.totalCantidad === 0) {
      errors['cantidad'] = ['Debe ingresar al menos una cantidad en alguna selección'];
    } else if (this.totalCantidad > 10000) {
      errors['cantidad'] = ['La cantidad total no puede exceder las 10,000 javas'];
    }

    // Validar peso total
    if (this.totalPeso === 0) {
      errors['peso'] = ['Debe ingresar al menos un peso en alguna selección'];
    } else if (this.totalPeso > 100000) {
      errors['peso'] = ['El peso total no puede exceder los 100,000 kg'];
    }

    // Validar cantidades negativas
    const cantidadesNegativas = this.registrosCantidad.some(reg => reg.cantidad < 0);
    if (cantidadesNegativas) {
      errors['cantidad'] = errors['cantidad'] || [];
      errors['cantidad'].push('Las cantidades no pueden ser negativas');
    }

    // Validar pesos negativos
    const pesosNegativos = this.registrosPeso.some(reg => reg.peso < 0);
    if (pesosNegativos) {
      errors['peso'] = errors['peso'] || [];
      errors['peso'].push('Los pesos no pueden ser negativos');
    }

    // Lanzar error si hay validaciones fallidas
    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Los datos del formulario no son válidos', errors);
    }
  }

  /**
   * Valida reglas de negocio específicas
   */
  private validarReglasDeNegocio(): void {
    // Validar que si hay cantidad, debe haber peso correspondiente
    for (let i = 0; i < this.registrosCantidad.length; i++) {
      const cantidad = this.registrosCantidad[i].cantidad;
      const peso = this.registrosPeso[i].peso;
      
      if (cantidad > 0 && peso === 0) {
        throw new BusinessError(
          `La selección "${this.registrosCantidad[i].key}" tiene cantidad pero no tiene peso registrado`
        );
      }
      
      if (peso > 0 && cantidad === 0) {
        throw new BusinessError(
          `La selección "${this.registrosCantidad[i].key}" tiene peso pero no tiene cantidad registrada`
        );
      }
    }

    // Validar peso promedio razonable por java
    const pesoPromedioPorJava = this.totalPeso / this.totalCantidad;
    if (pesoPromedioPorJava < 1) {
      throw new BusinessError(
        'El peso promedio por java es muy bajo (menor a 1kg). Verifique los datos ingresados.'
      );
    }
    if (pesoPromedioPorJava > 100) {
      throw new BusinessError(
        'El peso promedio por java es muy alto (mayor a 100kg). Verifique los datos ingresados.'
      );
    }
  }

  /**
   * Guarda el registro de cosecha
   */
  guardar() {
    try {
      // Validar formulario
      this.validarFormulario();

      // Validar reglas de negocio
      this.validarReglasDeNegocio();

      // Si las validaciones pasan, proceder a guardar
      const harvestData: HarvestRequest = {
        idSeller: this.idSeller,
        fruitName: this.nombreFruta.trim(),
        qty1ra: this.registrosCantidad[0].cantidad || 0,
        qty3ra: this.registrosCantidad[1].cantidad || 0,
        qty5ta: this.registrosCantidad[2].cantidad || 0,
        qtyMadura: this.registrosCantidad[3].cantidad || 0,
        weight1ra: this.registrosPeso[0].peso || 0,
        weight3ra: this.registrosPeso[1].peso || 0,
        weight5ta: this.registrosPeso[2].peso || 0,
        weightMadura: this.registrosPeso[3].peso || 0
      };

      // Mostrar loading mientras se guarda
      this.notificationService.loading('Guardando registro...');

      this.harvestService.save(harvestData).subscribe({
        next: (response) => {
          // Cerrar loading
          this.notificationService.close();

          // Construir mensaje de éxito detallado
          const mensaje = this.construirMensajeExito(response);
          
          // Mostrar notificación de éxito
          this.notificationService.success(mensaje, '¡Registro guardado exitosamente!', 0);
          
          // Limpiar formulario
          this.limpiarFormulario();
        },
        error: (error) => {
          // Cerrar loading
          this.notificationService.close();
          
          // El error ya fue manejado por el interceptor
          // pero podemos agregar lógica adicional aquí si es necesario
          console.error('Error al guardar registro:', error);
        }
      });

    } catch (error) {
      // Los errores de validación y de negocio serán manejados
      // por el GlobalErrorHandler automáticamente
      throw error;
    }
  }

  /**
   * Construye un mensaje de éxito detallado con los datos guardados
   */
  private construirMensajeExito(response: any): string {
    const fecha = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    let mensaje = `Fruta: ${response.fruitName}\n`;
    mensaje += `Fecha: ${fecha}\n\n`;
    mensaje += `📊 Resumen:\n`;
    mensaje += `• 1ª: ${response.qty1ra} javas (${response.weight1ra} kg)\n`;
    mensaje += `• 3ª: ${response.qty3ra} javas (${response.weight3ra} kg)\n`;
    mensaje += `• 5ª: ${response.qty5ta} javas (${response.weight5ta} kg)\n`;
    mensaje += `• Madura: ${response.qtyMadura} javas (${response.weightMadura} kg)\n\n`;
    mensaje += `📦 Total: ${response.qtyTotal} javas\n`;
    mensaje += `⚖️ Peso total: ${response.weightTotal} kg`;

    return mensaje;
  }

  /**
   * Limpia todos los campos del formulario
   */
  limpiarFormulario() {
    this.nombreFruta = '';
    this.registrosCantidad.forEach(reg => reg.cantidad = 0);
    this.registrosPeso.forEach(reg => reg.peso = 0);
  }
}