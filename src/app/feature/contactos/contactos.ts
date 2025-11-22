import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SupermarketCustomerService } from '../../core/services/supermarket-customer.service';
import { MarketCustomerService } from '../../core/services/market-customer.service';
import { SupermarketCustomer } from '../../core/interfaces/supermarket-customer.interface';
import { MarketCustomer } from '../../core/interfaces/market-customer.interface';
import { Contact } from '../../core/interfaces/contact.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [SupermarketCustomerService, MarketCustomerService],
  templateUrl: './contactos.html',
  styleUrl: './contactos.scss',
})
export class Contactos implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm: string = '';
  currentTypeFilter: 'supermercado' | 'mercado' | null = null;
  currentSortFilter: 'nombre' | 'ciudad' | 'distrito' | null = null;

  // Modals
  showModalTipo: boolean = false;
  showModalFiltros: boolean = false;
  showFormSupermercado: boolean = false;
  showFormMercado: boolean = false;
  showFormEditar: boolean = false;

  // Form data
  newContact: any = {};
  editingContact: Contact | null = null;

  constructor(
    private supermarketService: SupermarketCustomerService,
    private marketService: MarketCustomerService
  ) {}

  ngOnInit(): void {
    this.loadAllContacts();
  }

  loadAllContacts(): void {
    forkJoin({
      supermarkets: this.supermarketService.findAll(),
      markets: this.marketService.findAll()
    }).subscribe({
      next: (data) => {
        this.contacts = [
          ...this.mapSupermarketsToContacts(data.supermarkets),
          ...this.mapMarketsToContacts(data.markets)
        ];
        this.updateFilteredContacts();
      },
      error: (error) => {
        console.error('Error al cargar contactos:', error);
      }
    });
  }

  private mapSupermarketsToContacts(supermarkets: SupermarketCustomer[]): Contact[] {
    return supermarkets.map(s => ({
      id: s.idCustomer,
      type: 'supermercado' as const,
      name: s.supermarketName,
      city: s.city,
      district: s.district,
      ruc: s.ruc,
      phone: s.phone,
      email: s.email,
      deleted: s.state === 'I'
    }));
  }

  private mapMarketsToContacts(markets: MarketCustomer[]): Contact[] {
    return markets.map(m => ({
      id: m.idCustomer,
      type: 'mercado' as const,
      name: `${m.nombre} ${m.apellido}`,
      city: m.city,
      district: m.district,
      marketName: m.marketName,
      stall: m.positionNumber,
      firstName: m.nombre,
      lastName: m.apellido,
      dni: m.documentNumber,
      phone: m.phone,
      deleted: m.state === 'I'
    }));
  }

  // Modal methods
  openModalTipo(): void {
    this.showModalTipo = true;
  }

  openModalFiltros(): void {
    this.showModalFiltros = true;
  }

  openFormSupermercado(): void {
    this.showModalTipo = false;
    this.showFormSupermercado = true;
    this.newContact = {
      type: 'supermercado',
      city: '',
      district: '',
      name: '',
      ruc: '',
      phone: '',
      email: ''
    };
  }

  openFormMercado(): void {
    this.showModalTipo = false;
    this.showFormMercado = true;
    this.newContact = {
      type: 'mercado',
      city: '',
      district: '',
      marketName: '',
      stall: '',
      firstName: '',
      lastName: '',
      dni: '',
      phone: ''
    };
  }

  closeAllModals(): void {
    this.showModalTipo = false;
    this.showModalFiltros = false;
    this.showFormSupermercado = false;
    this.showFormMercado = false;
    this.showFormEditar = false;
    this.editingContact = null;
  }

  // Filter methods
  filterByType(type: 'supermercado' | 'mercado'): void {
    if (this.currentTypeFilter === type) {
      this.currentTypeFilter = null;
    } else {
      this.currentTypeFilter = type;
    }
    this.updateFilteredContacts();
  }

  toggleSortFilter(filterType: 'nombre' | 'ciudad' | 'distrito'): void {
    if (this.currentSortFilter === filterType) {
      this.currentSortFilter = null;
    } else {
      this.currentSortFilter = filterType;
    }
    this.updateFilteredContacts();
  }

  onSearch(): void {
    this.updateFilteredContacts();
  }

  updateFilteredContacts(): void {
    let result = [...this.contacts];

    // Apply type filter
    if (this.currentTypeFilter) {
      result = result.filter(c => c.type === this.currentTypeFilter);
    }

    // Apply search
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.district.toLowerCase().includes(term)
      );
    } else {
      // Hide deleted contacts when not searching
      result = result.filter(c => !c.deleted);
    }

    // Apply sort
    if (this.currentSortFilter) {
      result.sort((a, b) => {
        let valA = '';
        let valB = '';

        switch (this.currentSortFilter) {
          case 'nombre':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'ciudad':
            valA = a.city.toLowerCase();
            valB = b.city.toLowerCase();
            break;
          case 'distrito':
            valA = a.district.toLowerCase();
            valB = b.district.toLowerCase();
            break;
        }

        return valA.localeCompare(valB);
      });
    }

    this.filteredContacts = result;
  }

  // CRUD operations
  deleteContact(contact: Contact): void {
    if (!contact.id) return;

    if (contact.type === 'supermercado') {
      this.supermarketService.delete(contact.id).subscribe({
        next: () => {
          contact.deleted = true;
          this.updateFilteredContacts();
        },
        error: (error) => {
          console.error('Error al eliminar supermercado:', error);
        }
      });
    } else {
      this.marketService.delete(contact.id).subscribe({
        next: () => {
          contact.deleted = true;
          this.updateFilteredContacts();
        },
        error: (error) => {
          console.error('Error al eliminar mercado:', error);
        }
      });
    }
  }

  recoverContact(contact: Contact): void {
    if (!contact.id) return;

    if (contact.type === 'supermercado') {
      this.supermarketService.restore(contact.id).subscribe({
        next: () => {
          contact.deleted = false;
          this.updateFilteredContacts();
        },
        error: (error) => {
          console.error('Error al recuperar supermercado:', error);
        }
      });
    } else {
      this.marketService.restore(contact.id).subscribe({
        next: () => {
          contact.deleted = false;
          this.updateFilteredContacts();
        },
        error: (error) => {
          console.error('Error al recuperar mercado:', error);
        }
      });
    }
  }

  editContact(contact: Contact): void {
    this.editingContact = { ...contact };
    this.showFormEditar = true;
  }

  addContact(): void {
    if (this.newContact.type === 'supermercado') {
      const supermarketCustomer: SupermarketCustomer = {
        ruc: this.newContact.ruc,
        supermarketName: this.newContact.name,
        city: this.newContact.city,
        district: this.newContact.district,
        phone: this.newContact.phone,
        email: this.newContact.email,
        state: 'A'
      };

      this.supermarketService.save(supermarketCustomer).subscribe({
        next: (saved) => {
          this.contacts.push({
            id: saved.idCustomer,
            type: 'supermercado',
            name: saved.supermarketName,
            city: saved.city,
            district: saved.district,
            ruc: saved.ruc,
            phone: saved.phone,
            email: saved.email,
            deleted: false
          });
          this.updateFilteredContacts();
          this.closeAllModals();
        },
        error: (error) => {
          console.error('Error al agregar supermercado:', error);
        }
      });
    } else {
      const marketCustomer: MarketCustomer = {
        nombre: this.newContact.firstName,
        apellido: this.newContact.lastName,
        documentNumber: this.newContact.dni,
        marketName: this.newContact.marketName,
        positionNumber: this.newContact.stall,
        city: this.newContact.city,
        district: this.newContact.district,
        phone: this.newContact.phone,
        state: 'A'
      };

      this.marketService.save(marketCustomer).subscribe({
        next: (saved) => {
          this.contacts.push({
            id: saved.idCustomer,
            type: 'mercado',
            name: `${saved.nombre} ${saved.apellido}`,
            city: saved.city,
            district: saved.district,
            marketName: saved.marketName,
            stall: saved.positionNumber,
            firstName: saved.nombre,
            lastName: saved.apellido,
            dni: saved.documentNumber,
            phone: saved.phone,
            deleted: false
          });
          this.updateFilteredContacts();
          this.closeAllModals();
        },
        error: (error) => {
          console.error('Error al agregar mercado:', error);
        }
      });
    }
  }

  saveEdit(): void {
    if (!this.editingContact || !this.editingContact.id) return;

    if (this.editingContact.type === 'supermercado') {
      const supermarketCustomer: SupermarketCustomer = {
        idCustomer: this.editingContact.id,
        ruc: this.editingContact.ruc!,
        supermarketName: this.editingContact.name,
        city: this.editingContact.city,
        district: this.editingContact.district,
        phone: this.editingContact.phone!,
        email: this.editingContact.email!,
        state: this.editingContact.deleted ? 'I' : 'A'
      };

      this.supermarketService.update(supermarketCustomer).subscribe({
        next: (updated) => {
          const index = this.contacts.findIndex(c => c.id === this.editingContact!.id);
          if (index !== -1) {
            this.contacts[index] = {
              id: updated.idCustomer,
              type: 'supermercado',
              name: updated.supermarketName,
              city: updated.city,
              district: updated.district,
              ruc: updated.ruc,
              phone: updated.phone,
              email: updated.email,
              deleted: updated.state === 'I'
            };
            this.updateFilteredContacts();
          }
          this.closeAllModals();
        },
        error: (error) => {
          console.error('Error al actualizar supermercado:', error);
        }
      });
    } else {
      const marketCustomer: MarketCustomer = {
        idCustomer: this.editingContact.id,
        nombre: this.editingContact.firstName!,
        apellido: this.editingContact.lastName!,
        documentNumber: this.editingContact.dni!,
        marketName: this.editingContact.marketName!,
        positionNumber: this.editingContact.stall!,
        city: this.editingContact.city,
        district: this.editingContact.district,
        phone: this.editingContact.phone!,
        state: this.editingContact.deleted ? 'I' : 'A'
      };

      this.marketService.update(marketCustomer).subscribe({
        next: (updated) => {
          const index = this.contacts.findIndex(c => c.id === this.editingContact!.id);
          if (index !== -1) {
            this.contacts[index] = {
              id: updated.idCustomer,
              type: 'mercado',
              name: `${updated.nombre} ${updated.apellido}`,
              city: updated.city,
              district: updated.district,
              marketName: updated.marketName,
              stall: updated.positionNumber,
              firstName: updated.nombre,
              lastName: updated.apellido,
              dni: updated.documentNumber,
              phone: updated.phone,
              deleted: updated.state === 'I'
            };
            this.updateFilteredContacts();
          }
          this.closeAllModals();
        },
        error: (error) => {
          console.error('Error al actualizar mercado:', error);
        }
      });
    }
  }

  // Helper methods
  isTypeFilterActive(type: 'supermercado' | 'mercado'): boolean {
    return this.currentTypeFilter === type;
  }

  isSortFilterActive(filter: 'nombre' | 'ciudad' | 'distrito'): boolean {
    return this.currentSortFilter === filter;
  }
}