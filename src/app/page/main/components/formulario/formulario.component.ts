import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';

type Option = { label: string; value: string; exp: string };
type OptionEscuela = { label: string; value: string };
type OptionModalidad = { label: string; value: 'presencial' | 'semipresencial' | 'virtual' };

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
    RadioButtonModule,
    CheckboxModule
  ],
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class FormularioComponent {
  formularioForm: FormGroup;

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

  private correlativos = new Map<string, number>();

  escuelaOptions: OptionEscuela[] = [
    { label: 'Administración', value: 'adm' },
    { label: 'Ingeniería de Sistemas', value: 'sistemas' },
    { label: 'Derecho', value: 'derecho' },
    { label: 'Educación', value: 'educacion' },
    { label: 'Contabilidad', value: 'conta' },
    { label: 'Otro', value: 'otro' }
  ];

  modalidadOptions: OptionModalidad[] = [
    { label: 'Presencial', value: 'presencial' },
    { label: 'Semipresencial', value: 'semipresencial' },
    { label: 'Virtual', value: 'virtual' }
  ];

  selectedFiles: File[] = [];
  submitting = signal(false);

  constructor(private fb: FormBuilder) {
    this.formularioForm = this.fb.group({
      filial: ['', Validators.required],

      // Tipo de Usuario
      tipoUsuario: ['', Validators.required],

      // Información Personal
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', [Validators.required, Validators.pattern(/^(\d{8}|[A-Za-z0-9\-]{6,20})$/)]],
      escuelaProfesional: ['', Validators.required],
      modalidad: ['', Validators.required],
      domicilio: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],

      // Apoderado
      isApoderado: [false],
      apoderadoApellidos: [''],
      apoderadoNombres: [''],
      apoderadoEmail: [''],

      // Información Laboral (solo Administrativo)
      escuela: [''], // Área/Servicio

      // Descripción
      expone: ['', [Validators.required, Validators.minLength(50)]],
      solicita: ['', [Validators.required, Validators.minLength(20)]],

      // ¿Se ingresó a otra área? (obligatorio al menos una)
      otraArea: this.fb.group({
        libro: [false],
        tribunal: [false],
        comision: [false],
        direccion: [false],
        secretaria: [false],
        cap: [false],
        otro: [false]
      }, { validators: [this.alMenosUnaSeleccion()] }),
      otraAreaOtro: ['']
    });

    // Reglas reactivas
    this.formularioForm.get('filial')?.valueChanges.subscribe((filialValue) => {
      this.generarExpediente(filialValue);
    });

    this.formularioForm.get('tipoUsuario')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresSegunTipoUsuario();
    });

    this.formularioForm.get('isApoderado')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresApoderado();
    });

    this.formularioForm.get('otraArea')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresOtraArea();
    });

    // Inicializar reglas
    this.actualizarValidadoresSegunTipoUsuario();
    this.actualizarValidadoresApoderado();
    this.actualizarValidadoresOtraArea();
  }

  // === Validadores personalizados ===
  private alMenosUnaSeleccion() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as Record<string, boolean>;
      const alguno = Object.values(value || {}).some(Boolean);
      return alguno ? null : { ningunaSeleccionada: true };
    };
  }

  private actualizarValidadoresSegunTipoUsuario() {
    const tipo = this.formularioForm.get('tipoUsuario')?.value;
    const areaCtrl = this.formularioForm.get('escuela');

    if (tipo === 'administrativo') {
      areaCtrl?.addValidators([Validators.required]);
    } else {
      areaCtrl?.clearValidators();
      areaCtrl?.setValue('');
    }
    areaCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private actualizarValidadoresApoderado() {
    const isAp = this.formularioForm.get('isApoderado')?.value;

    const ape = this.formularioForm.get('apoderadoApellidos');
    const nom = this.formularioForm.get('apoderadoNombres');
    const mail = this.formularioForm.get('apoderadoEmail');

    if (isAp) {
      ape?.addValidators([Validators.required]);
      nom?.addValidators([Validators.required]);
      mail?.addValidators([Validators.required, Validators.email]);
    } else {
      ape?.clearValidators(); ape?.setValue('');
      nom?.clearValidators(); nom?.setValue('');
      mail?.clearValidators(); mail?.setValue('');
    }

    ape?.updateValueAndValidity({ emitEvent: false });
    nom?.updateValueAndValidity({ emitEvent: false });
    mail?.updateValueAndValidity({ emitEvent: false });
  }

  private actualizarValidadoresOtraArea() {
    const grupo = this.formularioForm.get('otraArea')!;
    const otroChecked = (grupo.value as any)?.otro;
    const otroCtrl = this.formularioForm.get('otraAreaOtro')!;
    if (otroChecked) {
      otroCtrl.addValidators([Validators.required, Validators.minLength(3)]);
    } else {
      otroCtrl.clearValidators();
      otroCtrl.setValue('');
    }
    otroCtrl.updateValueAndValidity({ emitEvent: false });
  }

  // === Helpers ===
  private generarExpediente(filialValue: string) {
    const filial = this.filialOptions.find(f => f.value === filialValue);
    if (!filial) return;
    const exp = filial.exp.toUpperCase();
    const current = this.correlativos.get(exp) || 0;
    const next = current + 1;
    this.correlativos.set(exp, next);
    this.expediente = `EXPE-${exp}-${next.toString().padStart(4, '0')}`;
  }

  isInvalid(controlName: keyof typeof this.formularioForm.controls): boolean {
    const ctrl = this.formularioForm.get(controlName as string);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  // FileUpload custom
  onUpload(event: FileUploadHandlerEvent) {
    const incoming = (event.files ?? []) as File[];
    this.selectedFiles = [...this.selectedFiles, ...incoming];
  }

  removeSelected(index: number) {
    this.selectedFiles.splice(index, 1);
    this.selectedFiles = [...this.selectedFiles];
  }

  limpiarFormulario() {
    this.formularioForm.reset();
    this.selectedFiles = [];
  }

  enviarFormulario() {
    // Validación adicional del grupo otraArea
    const otraAreaGrp = this.formularioForm.get('otraArea')!;
    otraAreaGrp.updateValueAndValidity();

    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    // Transformar “otraArea” (booleans) a lista de áreas seleccionadas
    const otraAreaRaw = otraAreaGrp.value as Record<string, boolean>;
    const mapKeys: Record<string, string> = {
      libro: 'Libro de Reclamaciones',
      tribunal: 'Tribunal de Honor',
      comision: 'Comisión de Hostigamiento',
      direccion: 'Dirección General',
      secretaria: 'Secretaría General',
      cap: 'Centro de Atención Personalizada',
      otro: 'Otro'
    };
    const otraAreasSeleccionadas = Object.entries(otraAreaRaw)
      .filter(([, v]) => v)
      .map(([k]) => mapKeys[k]);

    const payload = {
      ...this.formularioForm.value,
      otraAreasSeleccionadas,
      otraAreaOtro: this.formularioForm.get('otraAreaOtro')?.value || null,
      evidencias: this.selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };

    try {
      this.submitting.set(true);
      console.log('Formulario válido. Payload a enviar:', payload);
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
