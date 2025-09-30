import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { DefensoriaUniversitariaService } from '../../../../page/main/services/defensoria-universitaria.service';
import { CampusDU } from '../../../../page/main/interface/campus.interface';

interface SelectOption {
  label: string;
  value: CampusDU;
}

@Component({
  selector: 'app-select-filiales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ProgressSpinnerModule,
    ButtonModule
  ],
  templateUrl: './select-filiales.component.html',
  styleUrls: ['./select-filiales.component.scss']
})
export class SelectFilialesComponent implements OnInit {
  @Input() placeholder: string = 'Seleccione una filial';
  @Input() disabled: boolean = false;
  @Input() selectedValue: CampusDU | null = null;

  @Output() onSelectionChange = new EventEmitter<CampusDU | null>();

  // Signals para manejo de estado
  private filiales = signal<CampusDU[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Computed signals
  filialOptions = signal<SelectOption[]>([]);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private defensoriaService: DefensoriaUniversitariaService) {}

  ngOnInit(): void {
    this.loadFiliales();
  }

  loadFiliales(): void {
    this.loading.set(true);
    this.error.set(null);
    this.isLoading.set(true);
    this.hasError.set(false);

    this.defensoriaService.post_CampusDU().subscribe({
      next: (response) => {
        if (response.body?.isSuccess && response.body.lstItem) {
          const filiales = response.body.lstItem
            .filter(filial => filial.cPerApellido && filial.cPerApellido.trim().length > 0)
            .sort((a, b) => a.cPerApellido.localeCompare(b.cPerApellido, 'es', { sensitivity: 'base' }));

          this.filiales.set(filiales);

          // Convertir a opciones para el select
          const options: SelectOption[] = filiales.map(filial => ({
            label: filial.cPerApellido,
            value: filial
          }));

          this.filialOptions.set(options);
          this.loading.set(false);
          this.isLoading.set(false);
        } else {
          this.handleError('No se encontraron filiales en la respuesta');
        }
      },
      error: (error) => {
        console.error('Error cargando filiales:', error);
        this.handleError('Error de conexión al cargar las filiales');
      }
    });
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.loading.set(false);
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set(message);
    this.filialOptions.set([]);
  }
}