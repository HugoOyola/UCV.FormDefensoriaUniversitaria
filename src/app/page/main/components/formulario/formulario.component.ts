import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';

type Option = { label: string; value: string; exp: string };

type OptionEscuela = { label: string; value: string };

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    DividerModule,
    FileUploadModule,
    RadioButtonModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class FormularioComponent {
  formularioForm: FormGroup;

  // Header/Footer helpers
  today = new Date();
  currentYear = this.today.getFullYear();
  expediente = '';

  filialOptions: Option[] = [
    { label: 'UCV FILIAL ATE VITARTE', value: '6600000000', exp: 'ate' },
    { label: 'UCV FILIAL CALLAO', value: '6700000000', exp: 'cal' },
    { label: 'UCV FILIAL CHEPEN', value: '7100000000', exp: 'che' },
    { label: 'UCV FILIAL CHICLAYO', value: '1000003204', exp: 'cix' },
    { label: 'UCV FILIAL CHIMBOTE', value: '1000147917', exp: 'chi' },
    { label: 'UCV FILIAL HUARAZ', value: '6800000000', exp: 'hua' },
    { label: 'UCV FILIAL LIMA CENTRO', value: '7500000000', exp: 'lce' },
    { label: 'UCV FILIAL LIMA ESTE', value: '6500000000', exp: 'les' },
    { label: 'UCV FILIAL LIMA NORTE', value: '1000095671', exp: 'lno' },
    { label: 'UCV FILIAL MOYOBAMBA', value: '6900000000', exp: 'moy' },
    { label: 'UCV FILIAL PIURA', value: '1000114557', exp: 'piu' },
    { label: 'UCV FILIAL TARAPOTO', value: '1000136996', exp: 'tar' },
    { label: 'UCV FILIAL TRUJILLO', value: '1000098770', exp: 'tru' }
  ];

  // Map para llevar correlativos por filial
  private correlativos = new Map<string, number>();

  // Opciones de Escuela / Área / Servicio (ejemplo)
  escuelaOptions: OptionEscuela[] = [
    { label: 'Facultad de Ingeniería', value: 'fi' },
    { label: 'Facultad de Derecho', value: 'fd' },
    { label: 'Facultad de Educación', value: 'fe' },
    { label: 'Dirección Académica de Responsabilidad Social (DARS)', value: 'dars' },
    { label: 'Biblioteca Central', value: 'biblio' },
    { label: 'Tesorería', value: 'tesoreria' },
    { label: 'Otro', value: 'otro' }
  ];

  // Archivos seleccionados (UI)
  selectedFiles: File[] = [];
  // Bandera de envío
  submitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.formularioForm = this.fb.group({
      filial: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      // Documento: 8 dígitos para DNI o texto para pasaporte (validamos al menos algo razonable)
      documento: ['', [Validators.required, Validators.pattern(/^(\d{8}|[A-Za-z0-9\-]{6,20})$/)]],
      domicilio: ['', Validators.required],
      // Teléfono peruano: 9 dígitos
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      tipoUsuario: ['', Validators.required],
      escuela: ['', Validators.required],
      expone: ['', [Validators.required, Validators.minLength(50)]],
      solicita: ['', [Validators.required, Validators.minLength(20)]]
    });

    // Escuchar cambios en filial
    this.formularioForm.get('filial')?.valueChanges.subscribe((filialValue) => {
      this.generarExpediente(filialValue);
    });
  }

  private generarExpediente(filialValue: string) {
    const filial = this.filialOptions.find(f => f.value === filialValue);
    if (!filial) return;

    const exp = filial.exp.toUpperCase();

    // Obtener correlativo actual o inicializar en 0
    const current = this.correlativos.get(exp) || 0;
    const next = current + 1;

    // Guardar el nuevo correlativo
    this.correlativos.set(exp, next);

    // Formatear
    this.expediente = `EXPE-${exp}-${next.toString().padStart(4, '0')}`;
  }

  // Helpers de validación
  isInvalid(controlName: keyof typeof this.formularioForm.controls): boolean {
    const ctrl = this.formularioForm.get(controlName as string);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  // FileUpload custom
  onUpload(event: FileUploadHandlerEvent) {
    // event.files es File[]
    const incoming = (event.files ?? []) as File[];
    // Filtrar por tamaño/mime si deseas lógica adicional
    this.selectedFiles = [...this.selectedFiles, ...incoming];
    // Si necesitas limpiar el input, hazlo desde la plantilla usando una referencia local
  }

  removeSelected(index: number) {
    this.selectedFiles.splice(index, 1);
    // forzar detección si fuera necesario
    this.selectedFiles = [...this.selectedFiles];
  }

  limpiarFormulario() {
    this.formularioForm.reset();
    this.selectedFiles = [];
  }

  enviarFormulario() {
    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    const payload = {
      ...this.formularioForm.value,
      evidencias: this.selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    // Simulación de envío
    try {
      this.submitting.set(true);
      console.log('Formulario válido. Payload a enviar:', payload);
      // TODO: reemplazar por tu servicio HTTP
      // this.http.post('/api/denuncias', formData).subscribe(...)
      alert('Formulario enviado correctamente');
      this.limpiarFormulario();
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error al enviar el formulario. Intente nuevamente.');
    } finally {
      this.submitting.set(false);
    }
  }
}
