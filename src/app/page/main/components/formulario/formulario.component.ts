import { Component, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { BadgeModule } from 'primeng/badge';
import { SelectFilialesComponent } from '../../../../core/shared/components/select-filiales/select-filiales.component';
import { DefensoriaUniversitariaService } from '../../services/defensoria-universitaria.service';
import { CampusDU } from '../../interface/campus.interface';
import { RegistroExpedienteDU } from '../../interface/registro-expediente.interface';

type OptionEscuela = { label: string; value: string };
type OptionModalidad = { label: string; value: number };
type OptionArea = { label: string; value: string };

interface UploadedFile {
  name: string;
  size: number;
  objectURL: string;
  file: File;
}

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
    BadgeModule,
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
  idExpediente = 0;
  correoFilial = '';

  private correlativos = new Map<string, number>();

  escuelaOptions = signal<OptionEscuela[]>([]);
  escuelasLoading = signal(false);

  areaOptions = signal<OptionArea[]>([]);

  modalidadOptions = signal<OptionModalidad[]>([]);
  modalidadesLoading = signal(false);

  // Sistema de archivos mejorado
  selectedFiles: UploadedFile[] = [];
  submitting = signal(false);
  filialSeleccionada: CampusDU | null = null;

  // Control del componente FileUpload de PrimeNG
  @ViewChild('fileUpload') fileUpload: any;

  // Límites para archivos
  readonly MAX_FILE_SIZE = 10485760; // 10 MB en bytes
  readonly MAX_FILES = 3;
  readonly ALLOWED_EXTENSIONS = [
    // Documentos
    '.pdf', '.doc', '.docx', '.txt', '.odt',
    // Imágenes
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    // Audio
    '.mp3', '.wav', '.ogg', '.m4a',
    // Video
    '.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'
  ];

  get hasFilialSelected(): boolean {
    return this.filialSeleccionada !== null;
  }

  get canUploadMore(): boolean {
    return this.selectedFiles.length < this.MAX_FILES;
  }

  get totalSize(): string {
    const total = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
    return this.formatSize(total);
  }

  // Mapeo: key del checkbox -> valor numérico a enviar
  private readonly OTRA_AREA_VALUES: Record<string, number> = {
    libro: 1,
    tribunal: 2,
    comision: 3,
    direccion: 4,
    secretaria: 5,
    cap: 6,
    otro: 7
  };

  constructor(
    private fb: FormBuilder,
    private defensoriaService: DefensoriaUniversitariaService
  ) {
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

    this.setupFormSubscriptions();
  }

  ngOnInit(): void {
    this.cargarModalidades();
  }

  private setupFormSubscriptions(): void {
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
      this.defensoriaService.post_NumeroExpedienteDU(filial.cperjuridica).subscribe({
        next: (response) => {
          if (response.body?.isSuccess && response.body.item) {
            this.idExpediente = parseInt(response.body.item.nroExpediente) || 0;
            this.expediente = response.body.item.codigoExpediente;
            this.correoFilial = response.body.item.correoExpediente || '';

            console.log('Expediente obtenido:', {
              idExpediente: this.idExpediente,
              codigoExpediente: this.expediente,
              correoFilial: this.correoFilial
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
      this.correoFilial = '';
    }
  }

  private generarExpedienteLocal(filial: CampusDU): void {
    const exp = filial.pS_ESTABID.toUpperCase();
    const current = this.correlativos.get(exp) || 0;
    const next = current + 1;
    this.correlativos.set(exp, next);
    this.idExpediente = next;
    this.expediente = `EXPE-${exp}-${next.toString().padStart(4, '0')}`;
    this.correoFilial = '';
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.formularioForm.get(controlName);
    return !!ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  // ========== MÉTODOS PARA MANEJO DE ARCHIVOS ==========

  // Maneja la selección de archivos
  onFileSelect(event: any): void {
    let files: File[] = [];

    console.log('=== ARCHIVOS SELECCIONADOS ===');
    console.log('Evento recibido:', event);

    // Priorizar currentFiles si existe (contiene los archivos acumulados)
    if (event.currentFiles && Array.isArray(event.currentFiles)) {
      files = event.currentFiles;
    }
    // Si no, intentar con event.files (puede ser FileList o Array)
    else if (event.files) {
      // Convertir FileList a Array si es necesario
      if (event.files instanceof FileList) {
        files = Array.from(event.files);
      } else if (Array.isArray(event.files)) {
        files = event.files;
      } else {
        files = [event.files];
      }
    }

    console.log(`Total de archivos en el evento: ${files.length}`);

    files.forEach((file, index) => {
      // Validar que el archivo sea válido
      if (!file || !file.name) {
        console.warn(`Archivo ${index + 1}: Objeto de archivo inválido`, file);
        return;
      }

      // Verificar si el archivo ya existe en la lista
      const existeArchivo = this.selectedFiles.some(f =>
        f.name === file.name && f.size === file.size
      );

      if (existeArchivo) {
        console.warn(`Archivo "${file.name}" ya está en la lista`);
        return;
      }

      // Validar límite de archivos
      if (this.selectedFiles.length >= this.MAX_FILES) {
        console.warn(`No se puede agregar más archivos. Límite: ${this.MAX_FILES}`);
        return;
      }

      // Validar tamaño
      if (file.size > this.MAX_FILE_SIZE) {
        console.error(`Archivo "${file.name}" excede el tamaño máximo de ${this.formatSize(this.MAX_FILE_SIZE)}`);
        return;
      }

      // Validar extensión
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
        console.error(`Archivo "${file.name}" tiene una extensión no permitida`);
        return;
      }

      // Crear URL del objeto para preview
      const objectURL = URL.createObjectURL(file);

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        objectURL: objectURL,
        file: file
      };

      this.selectedFiles.push(uploadedFile);

      console.log(`✓ Archivo ${index + 1} agregado:`, {
        nombre: file.name,
        tamaño: this.formatSize(file.size),
        tipo: file.type,
        extensión: extension
      });
    });

    console.log(`Total archivos seleccionados: ${this.selectedFiles.length}`);
    console.log('Tamaño total:', this.totalSize);

    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  // Elimina un archivo de la lista
  onRemoveFile(index: number): void {
    const removedFile = this.selectedFiles[index];

    console.log('=== ELIMINANDO ARCHIVO ===');
    console.log(`Archivo: ${removedFile.name}`);
    console.log(`Tamaño: ${this.formatSize(removedFile.size)}`);

    // Liberar memoria del objectURL
    URL.revokeObjectURL(removedFile.objectURL);

    this.selectedFiles.splice(index, 1);

    console.log(`Archivos restantes: ${this.selectedFiles.length}`);

    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  // Limpia todos los archivos
  onClearFiles(): void {
    console.log('=== LIMPIANDO TODOS LOS ARCHIVOS ===');
    console.log(`Total archivos eliminados: ${this.selectedFiles.length}`);

    // Liberar memoria de todos los objectURLs
    this.selectedFiles.forEach(file => {
      URL.revokeObjectURL(file.objectURL);
    });

    this.selectedFiles = [];

    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  // Formatea el tamaño del archivo a formato legible
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtiene el ícono según el tipo de archivo
  getFileIcon(fileName: string): string {
    if (!fileName) return 'pi-file';

    const extension = fileName.split('.').pop()?.toLowerCase();

    const iconMap: Record<string, string> = {
      // Documentos
      'pdf': 'pi-file-pdf',
      'doc': 'pi-file-word',
      'docx': 'pi-file-word',
      'txt': 'pi-file',
      'odt': 'pi-file',
      // Imágenes
      'jpg': 'pi-image',
      'jpeg': 'pi-image',
      'png': 'pi-image',
      'gif': 'pi-image',
      'bmp': 'pi-image',
      'webp': 'pi-image',
      // Audio
      'mp3': 'pi-volume-up',
      'wav': 'pi-volume-up',
      'ogg': 'pi-volume-up',
      'm4a': 'pi-volume-up',
      // Video
      'mp4': 'pi-video',
      'avi': 'pi-video',
      'mov': 'pi-video',
      'wmv': 'pi-video',
      'mkv': 'pi-video',
      'webm': 'pi-video'
    };

    return iconMap[extension || ''] || 'pi-file';
  }

  // Obtiene el color del badge según el tipo de archivo
  getFileBadgeSeverity(fileName: string): 'success' | 'info' | 'warn' | 'danger' {
    if (!fileName) return 'info';

    const extension = fileName.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'info';
    }
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension || '')) {
      return 'success';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(extension || '')) {
      return 'warn';
    }
    return 'info';
  }

  // Obtiene la extensión del archivo de forma segura
  getFileExtension(fileName: string): string {
    if (!fileName) return 'FILE';
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  }

  // Verifica si el archivo es una imagen
  isImage(fileName: string): boolean {
    if (!fileName) return false;

    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
  }

  // ========== FIN MÉTODOS DE ARCHIVOS ==========

  limpiarFormulario() {
    this.formularioForm.reset();
    this.onClearFiles();
    this.filialSeleccionada = null;
    this.expediente = '';
    this.idExpediente = 0;
    this.correoFilial = '';
    this.escuelaOptions.set([]);
    this.areaOptions.set([]);
  }

  enviarFormulario() {
    const otraAreaGrp = this.formularioForm.get('otraArea')!;
    otraAreaGrp.updateValueAndValidity();

    if (this.formularioForm.invalid) {
      this.formularioForm.markAllAsTouched();
      console.log('Por favor, complete todos los campos requeridos.');
      return;
    }

    if (!this.idExpediente || !this.expediente) {
      console.log('No se pudo obtener el número de expediente. Por favor, seleccione nuevamente la filial.');
      return;
    }

    this.submitting.set(true);

    const otraAreaRaw = otraAreaGrp.value as Record<string, boolean>;
    const opciones: number[] = Object.entries(otraAreaRaw)
      .filter(([key, isChecked]) => isChecked && key in this.OTRA_AREA_VALUES)
      .map(([key]) => this.OTRA_AREA_VALUES[key]);

    const payload: RegistroExpedienteDU = {
      idExpediente: this.idExpediente,
      codigoExpediente: this.expediente,
      tipoUsuario: parseInt(this.formularioForm.value.tipoUsuario),
      cPerJuridica: this.formularioForm.value.filial,
      cPerApellido: this.filialSeleccionada?.cPerApellido || '',
      correoFilial: this.correoFilial,
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
      opciones: opciones.join(','),
      textoOtros: this.formularioForm.value.otraAreaOtro || '',
      descripcion: this.formularioForm.value.expone,
      solicita: this.formularioForm.value.solicita,
      Archivos: this.selectedFiles.map(f => f.name)
    };

    console.log('\n========================================');
    console.log('ENVIANDO FORMULARIO AL BACKEND');
    console.log('========================================');
    console.log('Datos del formulario:');
    console.log(JSON.stringify(payload, null, 2));

    console.log('\n Archivos adjuntos:');
    if (this.selectedFiles.length > 0) {
      console.log(`✓ Total: ${this.selectedFiles.length} archivo(s)`);
      console.log(`✓ Tamaño total: ${this.totalSize}`);
      this.selectedFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.name} (${this.formatSize(file.size)})`);
      });
    } else {
      console.log('Sin archivos adjuntos (opcional)');
    }
    console.log('========================================\n');

    // LLAMADA REAL AL SERVICIO
    this.defensoriaService.post_RegistrarExpedienteDU(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        console.log('✅ RESPUESTA DEL SERVIDOR:');
        console.log(response.body);

        if (response.body?.isSuccess) {
          console.log('✅ Formulario enviado exitosamente');
          console.log(`📁 Archivos procesados: ${this.selectedFiles.length}`);
          this.limpiarFormulario();
        }
      },
      error: (error) => {
        this.submitting.set(false);
        console.error('❌ ERROR AL ENVIAR FORMULARIO:');
        console.error(error);

        let errorMessage = 'Ocurrió un error al enviar el formulario.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        alert(`Error: ${errorMessage}\n\nPor favor, intente nuevamente o contacte al administrador del sistema.`);
      }
    });
  }
}