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
type OptionArea = { label: string; value: string };

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
export class FormularioComponent implements OnInit {
  formularioForm: FormGroup;

  today = new Date();
  currentYear = this.today.getFullYear();
  expediente = '';
  idExpediente = 0; // Guardar el ID del expediente desde la API

  private correlativos = new Map<string, number>();

  escuelaOptions = signal<OptionEscuela[]>([]);
  escuelasLoading = signal(false);

  areaOptions = signal<OptionArea[]>([]);

  modalidadOptions = signal<OptionModalidad[]>([]);
  modalidadesLoading = signal(false);

  selectedFiles: File[] = [];
  submitting = signal(false);
  filialSeleccionada: CampusDU | null = null;

  get hasFilialSelected(): boolean {
    return this.filialSeleccionada !== null;
  }

  // Mapeo corregido: key del checkbox -> valor numérico a enviar
  private readonly OTRA_AREA_VALUES: Record<string, number> = {
    libro: 1,
    tribunal: 2,
    comision: 3,
    direccion: 4,
    secretaria: 5,
    cap: 6,
    otro: 7
  };

  constructor(private fb: FormBuilder, private defensoriaService: DefensoriaUniversitariaService) {
    this.formularioForm = this.fb.group({
      filial: ['', Validators.required],
      tipoUsuario: ['', Validators.required],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      documento: ['', [Validators.required, Validators.pattern(/^(\d{8}|[A-Za-z0-9\-]{6,20})$/)]],
      escuelaProfesional: ['', Validators.required],
      modalidad: ['', Validators.required],
      domicilio: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      email: ['', [Validators.required, Validators.email]],
      isApoderado: [false],
      apoderadoApellidos: [''],
      apoderadoNombres: [''],
      apoderadoEmail: [''],
      area: [''],
      expone: ['', [Validators.required, Validators.minLength(50)]],
      solicita: ['', [Validators.required, Validators.minLength(20)]],
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

    this.formularioForm.get('tipoUsuario')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresSegunTipoUsuario();
    });

    this.formularioForm.get('isApoderado')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresApoderado();
    });

    this.formularioForm.get('otraArea')?.valueChanges.subscribe(() => {
      this.actualizarValidadoresOtraArea();
    });

    this.actualizarValidadoresSegunTipoUsuario();
    this.actualizarValidadoresApoderado();
    this.actualizarValidadoresOtraArea();
  }

  ngOnInit(): void {
    this.cargarModalidades();
  }

  private cargarEscuelasProfesionales(cperjuridica: string): void {
    this.escuelasLoading.set(true);
    this.formularioForm.patchValue({ escuelaProfesional: '' });

    this.defensoriaService.post_UnidadesAcademicasDU(cperjuridica).subscribe({
      next: (response) => {
        if (response.body?.isSuccess && response.body.lstItem) {
          const escuelas = response.body.lstItem
            .filter(unidad => unidad.cuniorgnombre && unidad.cuniorgnombre.trim().length > 0)
            .map(unidad => ({
              label: unidad.cuniorgnombre,
              value: unidad.nuniorgcodigo.toString()
            }))
            .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));

          this.escuelaOptions.set(escuelas);
        } else {
          this.escuelaOptions.set([]);
        }
        this.escuelasLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando unidades académicas:', error);
        this.escuelaOptions.set([]);
        this.escuelasLoading.set(false);
      }
    });
  }

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

  private alMenosUnaSeleccion() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as Record<string, boolean>;
      const alguno = Object.values(value || {}).some(Boolean);
      return alguno ? null : { ningunaSeleccionada: true };
    };
  }

  private actualizarValidadoresSegunTipoUsuario() {
    const tipo = this.formularioForm.get('tipoUsuario')?.value;
    const areaCtrl = this.formularioForm.get('area');
    const escuelaCtrl = this.formularioForm.get('escuelaProfesional');
    const modalidadCtrl = this.formularioForm.get('modalidad');

    if (tipo === '21') {
      areaCtrl?.setValidators([Validators.required]);
      areaCtrl?.enable();

      escuelaCtrl?.clearValidators();
      escuelaCtrl?.setValue('');
      escuelaCtrl?.disable();

      modalidadCtrl?.clearValidators();
      modalidadCtrl?.setValue('');
      modalidadCtrl?.disable();
    } else {
      areaCtrl?.clearValidators();
      areaCtrl?.setValue('');
      areaCtrl?.disable();

      escuelaCtrl?.setValidators([Validators.required]);
      escuelaCtrl?.enable();

      modalidadCtrl?.setValidators([Validators.required]);
      modalidadCtrl?.enable();
    }

    areaCtrl?.updateValueAndValidity({ emitEvent: false });
    escuelaCtrl?.updateValueAndValidity({ emitEvent: false });
    modalidadCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private actualizarValidadoresApoderado() {
    const isAp = this.formularioForm.get('isApoderado')?.value;

    const ape = this.formularioForm.get('apoderadoApellidos');
    const nom = this.formularioForm.get('apoderadoNombres');
    const mail = this.formularioForm.get('apoderadoEmail');

    if (isAp) {
      ape?.setValidators([Validators.required]);
      nom?.setValidators([Validators.required]);
      mail?.setValidators([Validators.required, Validators.email]);
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
      otroCtrl.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      otroCtrl.clearValidators();
      otroCtrl.setValue('');
    }
    otroCtrl.updateValueAndValidity({ emitEvent: false });
  }

  onFilialSeleccionada(filial: CampusDU | null): void {
    this.filialSeleccionada = filial;
    this.formularioForm.patchValue({ filial: filial?.cperjuridica || '' });

    this.formularioForm.patchValue({
      area: '',
      escuelaProfesional: ''
    });

    this.escuelaOptions.set([]);
    this.areaOptions.set([]);

    if (filial?.cperjuridica && filial?.pS_ESTABID) {
      // Obtener AMBOS valores del expediente desde la API
      this.defensoriaService.post_NumeroExpedienteDU(filial.cperjuridica).subscribe({
        next: (response) => {
          if (response.body?.isSuccess && response.body.item) {
            // Guardar ambos valores: ID numérico y código string
            this.idExpediente = parseInt(response.body.item.nroExpediente) || 0;
            this.expediente = response.body.item.codigoExpediente;

            console.log('📋 Expediente obtenido:', {
              idExpediente: this.idExpediente,
              codigoExpediente: this.expediente
            });
          } else {
            this.generarExpedienteLocal(filial);
          }
        },
        error: (error) => {
          console.error('Error obteniendo expediente:', error);
          this.generarExpedienteLocal(filial);
        }
      });

      this.cargarEscuelasProfesionales(filial.cperjuridica);
      this.cargarDepartamentos(filial.pS_ESTABID);
    } else {
      this.expediente = '';
      this.idExpediente = 0;
    }
  }

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

          this.areaOptions.set(departamentos);
        } else {
          this.areaOptions.set([]);
        }
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.areaOptions.set([]);
      }
    });
  }

  private generarExpedienteLocal(filial: CampusDU): void {
    const exp = filial.pS_ESTABID.toUpperCase();
    const current = this.correlativos.get(exp) || 0;
    const next = current + 1;
    this.correlativos.set(exp, next);
    this.idExpediente = next; // También actualizar el ID
    this.expediente = `EXPE-${exp}-${next.toString().padStart(4, '0')}`;
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.formularioForm.get(controlName);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

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
    this.escuelaOptions.set([]);
    this.areaOptions.set([]);
  }

  enviarFormulario() {
    const otraAreaGrp = this.formularioForm.get('otraArea')!;
    otraAreaGrp.updateValueAndValidity();

    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    // Transformar checkboxes a array de valores numéricos
    const otraAreaRaw = otraAreaGrp.value as Record<string, boolean>;
    const opciones: number[] = Object.entries(otraAreaRaw)
      .filter(([key, isChecked]) => isChecked && key in this.OTRA_AREA_VALUES)
      .map(([key]) => this.OTRA_AREA_VALUES[key]);

    // Construir payload según la estructura del API
    const payload = {
      idExpediente: this.idExpediente, // Usar el ID numérico obtenido del API
      codigoExpediente: this.expediente,
      tipoUsuario: parseInt(this.formularioForm.value.tipoUsuario),
      cPerJuridica: this.formularioForm.value.filial,
      cPerApellido: this.filialSeleccionada?.cPerApellido || '',
      correoFilial: this.formularioForm.value.email,
      nombres: this.formularioForm.value.nombre,
      apellidos: this.formularioForm.value.apellidos,
      dni: this.formularioForm.value.documento,
      nUniOrgCodigo: this.formularioForm.value.escuelaProfesional
        ? parseInt(this.formularioForm.value.escuelaProfesional)
        : 0,
      nModalidad: this.formularioForm.value.modalidad || 0,
      domicilio: this.formularioForm.value.domicilio,
      telefono: this.formularioForm.value.telefono,
      correo: this.formularioForm.value.email,
      existeApo: this.formularioForm.value.isApoderado,
      apellidosApo: this.formularioForm.value.apoderadoApellidos || '',
      nombresApo: this.formularioForm.value.apoderadoNombres || '',
      correoApo: this.formularioForm.value.apoderadoEmail || '',
      idDepartamento: this.formularioForm.value.area
        ? parseInt(this.formularioForm.value.area)
        : 0,
      opciones: opciones.join(','), // Array convertido a string separado por comas
      textoOtros: this.formularioForm.value.otraAreaOtro || '',
      descripcion: this.formularioForm.value.expone,
      solicita: this.formularioForm.value.solicita,
      Archivos: this.selectedFiles.map(f => f.name) // Array de nombres de archivos
    };

    console.log('=== DATOS DEL FORMULARIO ENVIADOS ===');
    console.log('📋 Estructura del API:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n✅ Áreas seleccionadas:', opciones);
    console.log('📝 Opciones como string:', payload.opciones);

    try {
      this.submitting.set(true);

      // Aquí harías la llamada real al servicio:
      // this.defensoriaService.enviarFormulario(payload).subscribe({
      //   next: (response) => {
      //     console.log('Respuesta del servidor:', response);
      //     alert('Formulario enviado correctamente');
      //     this.limpiarFormulario();
      //   },
      //   error: (error) => {
      //     console.error('Error:', error);
      //     alert('Ocurrió un error al enviar el formulario.');
      //   }
      // });

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