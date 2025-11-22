import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HarvestService } from '../../core/services/harvest.service';
import { Harvest, HarvestRequest } from '../../core/interfaces/harvest.interface';

// Interfaz auxiliar para la vista
interface RecordView {
  id: number;
  name: string;
  date: string;
  selections: {
    '1ra': number;
    '3ra': number;
    '5ta': number;
    'Madura': number;
    'Total': number;
  };
  peso: {
    '1ra': string;
    '3ra': string;
    '5ta': string;
    'Madura': string;
    'Total': string;
  };
  createdAt: number;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit, OnDestroy {
  records: RecordView[] = [];
  filteredRecords: RecordView[] = [];
  currentFilter: string | null = null;
  searchTerm: string = '';
  showFilterModal = false;
  showEditModal = false;
  showAlert = true;
  editingRecord: RecordView | null = null;
  isLoading = false;

  // Edit form fields
  editName = '';
  edit1ra = 0;
  edit1raPeso = '';
  edit3ra = 0;
  edit3raPeso = '';
  edit5ta = 0;
  edit5taPeso = '';
  editMadura = 0;
  editMaduraPeso = '';
  editTotalCantidad = 0;
  editTotalPeso = '';

  private updateInterval: any;

  constructor(private harvestService: HarvestService) { }

  ngOnInit() {
    this.loadRecords();

    // Actualizar cada minuto para verificar si los botones deben desaparecer
    this.updateInterval = setInterval(() => {
      this.renderRecords(this.records);
    }, 60000); // 1 minuto
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  loadRecords() {
    this.isLoading = true;
    // Cargar solo registros activos (state = 'A')
    this.harvestService.findByState('A').subscribe({
      next: (harvests) => {
        this.records = this.mapHarvestsToRecordView(harvests);
        this.renderRecords(this.records);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar registros:', error);
        alert('Error al cargar los registros. Por favor, intente nuevamente.');
        this.isLoading = false;
      }
    });
  }

  // Mapear datos del backend al formato de la vista
  private mapHarvestsToRecordView(harvests: Harvest[]): RecordView[] {
    return harvests.map(h => ({
      id: h.idHarvest!,
      name: h.fruitName,
      date: h.harvestDate || new Date().toISOString().split('T')[0],
      selections: {
        '1ra': h.qty1ra,
        '3ra': h.qty3ra,
        '5ta': h.qty5ta,
        'Madura': h.qtyMadura,
        'Total': h.qtyTotal || (h.qty1ra + h.qty3ra + h.qty5ta + h.qtyMadura)
      },
      peso: {
        '1ra': h.weight1ra ? `${h.weight1ra}kg` : '0kg',
        '3ra': h.weight3ra ? `${h.weight3ra}kg` : '0kg',
        '5ta': h.weight5ta ? `${h.weight5ta}kg` : '0kg',
        'Madura': h.weightMadura ? `${h.weightMadura}kg` : '0kg',
        'Total': h.weightTotal ? `${h.weightTotal}kg` : '0kg'
      },
      createdAt: h.createdAt ? new Date(h.createdAt).getTime() : Date.now()
    }));
  }

  closeAlert() {
    this.showAlert = false;
  }

  openFilterModal() {
    if (this.currentFilter) {
      this.removeFilter();
    } else {
      this.showFilterModal = true;
    }
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  applyFilter(filterType: string) {
    this.currentFilter = filterType;
    this.showFilterModal = false;

    let filtered = this.searchTerm ?
      this.records.filter(r => r.name.toLowerCase().includes(this.searchTerm.toLowerCase())) :
      [...this.records];

    this.filteredRecords = this.sortRecords(filtered, filterType);
  }

  removeFilter() {
    this.currentFilter = null;
    this.renderRecords(this.records);
  }

  sortRecords(recordsArray: RecordView[], filterType: string): RecordView[] {
    let sorted = [...recordsArray];

    switch (filterType) {
      case 'az':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
    }

    return sorted;
  }

  onSearch() {
    if (this.searchTerm === '') {
      if (this.currentFilter) {
        this.applyFilter(this.currentFilter);
      } else {
        this.renderRecords(this.records);
      }
      return;
    }

    const filtered = this.records.filter(record =>
      record.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.currentFilter) {
      this.filteredRecords = this.sortRecords(filtered, this.currentFilter);
    } else {
      this.renderRecords(filtered);
    }
  }

  renderRecords(recordsToRender: RecordView[]) {
    this.filteredRecords = recordsToRender;
  }

  canEditRecord(createdAt: number): boolean {
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en milisegundos
    const now = Date.now();
    return (now - createdAt) < thirtyMinutes;
  }

  openEditModal(record: RecordView) {
    this.editingRecord = record;
    this.editName = record.name;
    this.edit1ra = record.selections['1ra'];
    this.edit1raPeso = record.peso['1ra'].replace('kg', '') || '';
    this.edit3ra = record.selections['3ra'];
    this.edit3raPeso = record.peso['3ra'].replace('kg', '') || '';
    this.edit5ta = record.selections['5ta'];
    this.edit5taPeso = record.peso['5ta'].replace('kg', '') || '';
    this.editMadura = record.selections['Madura'];
    this.editMaduraPeso = record.peso['Madura'].replace('kg', '') || '';

    this.updateTotal();
    this.updateTotalPeso();
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingRecord = null;
  }

  updateTotal() {
    this.editTotalCantidad = this.edit1ra + this.edit3ra + this.edit5ta + this.editMadura;
  }

  updateTotalPeso() {
    const peso1ra = parseFloat(this.edit1raPeso) || 0;
    const peso3ra = parseFloat(this.edit3raPeso) || 0;
    const peso5ta = parseFloat(this.edit5taPeso) || 0;
    const pesoMadura = parseFloat(this.editMaduraPeso) || 0;

    const total = peso1ra + peso3ra + peso5ta + pesoMadura;
    this.editTotalPeso = total > 0 ? total + 'kg' : '';
  }

  saveEdit() {
    if (!this.editingRecord) return;

    const updatedHarvest: Harvest = {
      idHarvest: this.editingRecord.id,
      idSeller: 1, // Aquí deberías obtener el ID del vendedor actual
      fruitName: this.editName,
      qty1ra: this.edit1ra,
      qty3ra: this.edit3ra,
      qty5ta: this.edit5ta,
      qtyMadura: this.editMadura,
      weight1ra: parseFloat(this.edit1raPeso) || 0,
      weight3ra: parseFloat(this.edit3raPeso) || 0,
      weight5ta: parseFloat(this.edit5taPeso) || 0,
      weightMadura: parseFloat(this.editMaduraPeso) || 0
    };

    this.harvestService.update(updatedHarvest).subscribe({
      next: (response) => {
        console.log('Registro actualizado:', response);
        this.closeEditModal();
        this.loadRecords();
        
        if (this.currentFilter) {
          this.applyFilter(this.currentFilter);
        }
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        alert('Error al actualizar el registro. Por favor, intente nuevamente.');
      }
    });
  }

  deleteRecord(recordId: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.harvestService.delete(recordId).subscribe({
        next: (response) => {
          console.log('Registro eliminado:', response);
          this.loadRecords();

          if (this.currentFilter) {
            this.applyFilter(this.currentFilter);
          }
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el registro. Por favor, intente nuevamente.');
        }
      });
    }
  }

  getGroupedRecords() {
    if (this.currentFilter === 'az' || this.currentFilter === 'za') {
      return this.filteredRecords.map(record => ({ type: 'record', record }));
    }

    const grouped: { [key: string]: RecordView[] } = {};

    this.filteredRecords.forEach(record => {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (this.currentFilter === 'oldest') {
        return new Date(a).getTime() - new Date(b).getTime();
      }
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const result: any[] = [];
    sortedDates.forEach(date => {
      result.push({ type: 'date', date: this.formatDate(date) });
      grouped[date].forEach(record => {
        result.push({ type: 'record', record });
      });
    });

    return result;
  }

  formatDate(dateStr: string): string {
    return dateStr.split('-').reverse().join(' / ');
  }
}