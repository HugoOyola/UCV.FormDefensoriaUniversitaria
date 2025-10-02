export interface RegistroExpedienteDU {
  idExpediente: number;           // ID numérico del expediente
  codigoExpediente: string;       // Código alfanumérico del expediente
  tipoUsuario: number;            // Tipo de usuario (13=Estudiante, 12=Docente, 21=Administrativo, etc.)
  cPerJuridica: string;           // Código de persona jurídica de la filial
  cPerApellido: string;           // Nombre de la filial
  correoFilial: string;           // Correo de la filial
  nombres: string;                // Nombres del usuario
  apellidos: string;              // Apellidos del usuario
  dni: string;                    // DNI o documento de identidad
  nUniOrgCodigo: number;          // Código de unidad organizacional (escuela profesional)
  nModalidad: number;             // Código de modalidad
  domicilio: string;              // Domicilio del usuario
  telefono: string;               // Teléfono del usuario
  correo: string;                 // Correo electrónico del usuario
  existeApo: boolean;             // Indica si hay apoderado
  apellidosApo: string;           // Apellidos del apoderado
  nombresApo: string;             // Nombres del apoderado
  correoApo: string;              // Correo del apoderado
  idDepartamento: number;         // ID del departamento/área
  opciones: string;               // Opciones de áreas previas separadas por comas (ej: "1,3,7")
  textoOtros: string;             // Texto especificando "Otro" si aplica
  descripcion: string;            // Descripción del reclamo (EXPONE)
  solicita: string;               // Lo que solicita (SOLICITA)
  Archivos: string[];             // Array de nombres de archivos adjuntos
}

// Respuesta del servidor al registrar expediente
export interface RegistroExpedienteResponse {
  mensaje: string;                // Mensaje de confirmación
  idRegistro?: number;            // ID del registro creado (opcional)
  numeroExpediente?: string;      // Número de expediente asignado (opcional)
}