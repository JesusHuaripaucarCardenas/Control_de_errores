import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../core/services/seller.service';
import { Seller } from '../../core/interfaces/seller.interface';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  sellers: Seller[] = [];
  filteredSellers: Seller[] = [];
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  currentSeller: Seller = this.getEmptySeller();
  filterType: string = 'all';
  searchText: string = '';

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers(): void {
    this.sellerService.findAll().subscribe({
      next: (data) => {
        this.sellers = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading sellers:', err)
    });
  }

  getEmptySeller(): Seller {
    return {
      firstName: '',
      lastName: '',
      dni: '',
      email: '',
      phone: ''
    };
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.currentSeller = this.getEmptySeller();
    this.showModal = true;
  }

  openEditModal(seller: Seller): void {
    this.modalMode = 'edit';
    this.currentSeller = { ...seller };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSeller = this.getEmptySeller();
  }

  saveSeller(): void {
    if (!this.isValidSeller()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (this.modalMode === 'add') {
      this.sellerService.save(this.currentSeller).subscribe({
        next: () => {
          this.loadSellers();
          this.closeModal();
          alert('Vendedor agregado exitosamente');
        },
        error: (err) => {
          console.error('Error saving seller:', err);
          alert('Error al guardar el vendedor');
        }
      });
    } else {
      this.sellerService.update(this.currentSeller).subscribe({
        next: () => {
          this.loadSellers();
          this.closeModal();
          alert('Vendedor actualizado exitosamente');
        },
        error: (err) => {
          console.error('Error updating seller:', err);
          alert('Error al actualizar el vendedor');
        }
      });
    }
  }

  deleteSeller(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('¿Está seguro de que desea desactivar este vendedor?')) {
      this.sellerService.delete(id).subscribe({
        next: () => {
          this.loadSellers();
          alert('Vendedor desactivado exitosamente');
        },
        error: (err) => {
          console.error('Error deleting seller:', err);
          alert('Error al desactivar el vendedor');
        }
      });
    }
  }

  restoreSeller(id: number | undefined): void {
    if (!id) return;
    
    this.sellerService.restore(id).subscribe({
      next: () => {
        this.loadSellers();
        alert('Vendedor restaurado exitosamente');
      },
      error: (err) => {
        console.error('Error restoring seller:', err);
        alert('Error al restaurar el vendedor');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.sellers];

    // Filtrar por estado
    if (this.filterType === 'active') {
      filtered = filtered.filter(s => s.state === 'A');
    } else if (this.filterType === 'inactive') {
      filtered = filtered.filter(s => s.state === 'I');
    }

    // Filtrar por búsqueda de texto
    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(s => 
        s.firstName.toLowerCase().includes(search) ||
        s.lastName.toLowerCase().includes(search) ||
        s.dni.includes(search) ||
        s.email?.toLowerCase().includes(search)
      );
    }

    // Ordenar alfabéticamente
    if (this.filterType === 'alphabetical') {
      filtered.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    this.filteredSellers = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  isValidSeller(): boolean {
    return !!(
      this.currentSeller.firstName?.trim() &&
      this.currentSeller.lastName?.trim() &&
      this.currentSeller.dni?.trim() &&
      this.currentSeller.dni.length === 8
    );
  }

  getFullName(seller: Seller): string {
    return `${seller.firstName} ${seller.lastName}`;
  }

  getStateLabel(state: string | undefined): string {
    return state === 'A' ? 'Activo' : 'Inactivo';
  }

  getStateClass(state: string | undefined): string {
    return state === 'A' ? 'status-active' : 'status-inactive';
  }
}