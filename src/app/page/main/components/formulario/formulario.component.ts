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

type Option = { label: string; value: string };

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
  expediente = 'EX-EONDVKMRQ';

  filialOptions: Option[] = [
    { label: 'Sede Lima Centro', value: 'lima-centro' },
    { label: 'Sede Lima Norte', value: 'lima-norte' },
    { label: 'Sede Lima Sur', value: 'lima-sur' },
    { label: 'Sede Arequipa', value: 'arequipa' },
    { label: 'Sede Cusco', value: 'cusco' },
    { label: 'Sede Trujillo', value: 'trujillo' }
  ];

  // Opciones de Escuela / Área / Servicio (ejemplo)
  escuelaOptions: Option[] = [
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
  }

  // === Helpers de validación ===
  isInvalid(controlName: keyof typeof this.formularioForm.controls): boolean {
    const ctrl = this.formularioForm.get(controlName as string);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  // === FileUpload custom ===
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
