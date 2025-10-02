import { Component, signal, OnInit } from '@angular/core';
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
import { SelectFilialesComponent } from '../../../../core/shared/components/select-filiales/select-filiales.component';
import { DefensoriaUniversitariaService } from '../../services/defensoria-universitaria.service';
import { CampusDU } from '../../interface/campus.interface';
import { ModalidadDU } from '../../interface/modalidad.interface';

type OptionEscuela = { label: string; value: string };
type OptionModalidad = { label: string; value: number };

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
    CheckboxModule,
    SelectFilialesComponent
  ],
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class FormularioComponent {
  formularioForm: FormGroup;

  today = new Date();
  currentYear = this.today.getFullYear();
  expediente = '';

  private correlativos = new Map<string, number>();

  // Opciones dinámicas para áreas/departamentos (inicia vacío)
  escuelaOptions = signal<OptionEscuela[]>([]);

  // Signal para modalidades dinámicas desde API
  modalidadOptions = signal<OptionModalidad[]>([]);
  modalidadesLoading = signal(false);

  selectedFiles: File[] = [];
  submitting = signal(false);
  filialSeleccionada: CampusDU | null = null;

  // Propiedad para controlar mensajes informativos
  get hasFilialSelected(): boolean {
    return this.filialSeleccionada !== null;
  }

  constructor(private fb: FormBuilder, private defensoriaService: DefensoriaUniversitariaService) {
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

    // Reglas reactivas - Ya no necesitamos este subscribe ya que manejamos la filial de otra manera

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

  // Cargar modalidades al inicializar el componente
  ngOnInit(): void {
    this.cargarModalidades();
  }

  // Método para cargar modalidades desde la API
  private cargarModalidades(): void {
    this.modalidadesLoading.set(true);

    this.defensoriaService.get_ModalidadesDU().subscribe({
      next: (response) => {
        if (response.body?.isSuccess && response.body.lstItem) {
          const modalidades = response.body.lstItem
            .map(mod => ({
              label: mod.cIntDescripcion,
              value: mod.nIntCodigo
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

          this.modalidadOptions.set(modalidades);
        } else {
          console.warn('No se encontraron modalidades');
          this.modalidadOptions.set([]);
        }
        this.modalidadesLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando modalidades:', error);
        this.modalidadOptions.set([]);
        this.modalidadesLoading.set(false);
      }
    });
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

  // Método para manejar la selección de filial
  onFilialSeleccionada(filial: CampusDU | null): void {
    this.filialSeleccionada = filial;
    this.formularioForm.patchValue({ filial: filial?.cperjuridica || '' });

    // Limpiar área/escuela cuando cambia la filial
    this.formularioForm.patchValue({ escuela: '' });

    if (filial?.cperjuridica && filial?.pS_ESTABID) {
      // Obtener el expediente real desde la API
      this.defensoriaService.post_NumeroExpedienteDU(filial.cperjuridica).subscribe({
        next: (response) => {
          if (response.body?.isSuccess && response.body.item) {
            this.expediente = response.body.item.codigoExpediente;
          } else {
            // Fallback al método anterior si falla la API
            this.generarExpedienteLocal(filial);
          }
        },
        error: (error) => {
          console.error('Error obteniendo expediente:', error);
          // Fallback al método anterior si falla la API
          this.generarExpedienteLocal(filial);
        }
      });

      // Cargar departamentos/áreas para la filial seleccionada
      this.cargarDepartamentos(filial.pS_ESTABID);
    } else {
      this.expediente = '';
      // Limpiar opciones cuando no hay filial seleccionada
      this.escuelaOptions.set([]);
    }
  }

  // Método para cargar departamentos basado en la filial
  private cargarDepartamentos(estabid: string): void {
    this.defensoriaService.post_DepartamentosDU(estabid).subscribe({
      next: (response) => {
        if (response.body?.isSuccess && response.body.lstItem) {
          const departamentos = response.body.lstItem
            .filter(dept => dept.cUniOrgNombre && dept.cUniOrgNombre.trim().length > 0)
            .sort((a, b) => a.cUniOrgNombre.localeCompare(b.cUniOrgNombre, 'es', { sensitivity: 'base' }))
            .map(dept => ({
              label: dept.cUniOrgNombre,
              value: dept.nUniOrg
            }));

          this.escuelaOptions.set(departamentos);
        } else {
          console.warn('No se encontraron departamentos para la filial:', estabid);
          // Mantener opciones por defecto si no hay departamentos
        }
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        // Mantener opciones por defecto si falla la API
      }
    });
  }

  // Método fallback para generar expediente local (mantenemos por compatibilidad)
  private generarExpedienteLocal(filial: CampusDU): void {
    const exp = filial.pS_ESTABID.toUpperCase();
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
    this.filialSeleccionada = null;
    this.expediente = '';

    // Limpiar opciones de escuelas/áreas
    this.escuelaOptions.set([]);
  }  enviarFormulario() {
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

    // Mostrar en consola los datos completos que se envían
    console.log('=== DATOS DEL FORMULARIO ENVIADOS ===');
    console.log(JSON.stringify(payload, null, 2));
    // También puedes ver el objeto plano:
    console.log('Objeto plano:', payload);

    try {
      this.submitting.set(true);
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
