import {Injectable, inject, signal} from '@angular/core';
import {ModuleService} from '@shared/services/module.service';
import {AccesoRapido} from 'src/app/page/main/interface/principal';
import {MainSharedService} from './main-shared.service';

@Injectable({
	providedIn: 'root',
})
export class RecomendadoSharedService {
	private _moduleService = inject(ModuleService);
	private _mainSharedService = inject(MainSharedService);

	public AlumnoRecomendado = signal<{name: string; icon: string; abrirTrilce: boolean}[]>([
		{
			name: 'Mis solicitudes',
			icon: 'description',
			abrirTrilce: true,
		},
		{
			name: 'Pagos de Servicios',
			icon: 'trending_up',
			abrirTrilce: true,
		},
		{
			name: 'Detalle Economico',
			icon: 'paid',
			abrirTrilce: true,
		},
		{
			name: 'Mis asignaturas Matriculadas',
			icon: 'library_books',
			abrirTrilce: true,
		},
		{
			name: 'Record Academico',
			icon: 'school',
			abrirTrilce: true,
		},
		{
			name: 'Plan De Estudio',
			icon: 'text_snippet',
			abrirTrilce: false,
		},
		{
			name: 'Ficha De Matricula',
			icon: 'badge',
			abrirTrilce: true,
		},
		{
			name: 'Mi Beneficio Actual',
			icon: 'trending_up',
			abrirTrilce: true,
		},
		{
			name: 'Revisión Pares Aprobadores',
			icon: 'badge',
			abrirTrilce: true,
		},
		{
			name: 'Mis Solicitudes de Investigación',
			icon: 'manage_search',
			abrirTrilce: true,
		},
	]);
	public DocenteRecomendado = signal<{name: string; icon: string; abrirTrilce: boolean}[]>([
		{
			name: 'Mis Asignaturas Asignadas',
			icon: 'library_books',
			abrirTrilce: true,
		},
		{
			name: 'Ver CV',
			icon: 'description',
			abrirTrilce: false,
		},
		{
			name: 'Mis Solicitudes de Investigación',
			icon: 'manage_search',
			abrirTrilce: true,
		},
		{
			name: 'Mi Horario Laboral',
			icon: 'date_range',
			abrirTrilce: true,
		},
		{
			name: 'Aprobar Documentos',
			icon: 'playlist_add_check',
			abrirTrilce: true,
		},
		{
			name: 'Revisión de Productos',
			icon: 'rule',
			abrirTrilce: true,
		},
		{
			name: 'Evaluación Proyectos Exitosos',
			icon: 'add_task',
			abrirTrilce: true,
		},
		{
			name: 'Revisión Comité Ética',
			icon: 'how_to_reg',
			abrirTrilce: true,
		},
	]);
	public AdministrativoRecomendado = signal<{name: string; icon: string; abrirTrilce: boolean}[]>([
		{
			name: 'Ver CV',
			icon: 'description',
			abrirTrilce: false,
		},
		{
			name: 'Mi Horario Laboral',
			icon: 'date_range',
			abrirTrilce: true,
		},
		{
			name: 'Pagos de Servicios',
			icon: 'trending_up',
			abrirTrilce: true,
		},
	]);
	AbrirAccesoRapido(data: AccesoRapido): void {
		console.log('☺☺☺😚 =>', data);
		if (data.abrirTrilce) {
			window.parent.postMessage(
				{
					nombre: data.name,
				},
				'*'
			);
		} else {
			switch (data.name) {
				case 'Ver CV':
					this._moduleService.abrirModulo(
						`https://trilce.ucv.edu.pe/PerfilesGTH/CV/${this._mainSharedService.cPerCodigo()}?app=trilce&op=usr`,
						`https://trilce-qa.ucv.edu.pe/PerfilesGTH/CV/${this._mainSharedService.cPerCodigo()}?app=trilce&op=usr`
					);
					break;
				case 'Plan De Estudio':
					this._moduleService.abrirModulo(
						`https://campusalumno.azurewebsites.net/plan-estudio/${this._mainSharedService.cPerCodigoCifrado()}`,
						`https://campusalumnoqa.azurewebsites.net/plan-estudio/${this._mainSharedService.cPerCodigoCifrado()}`
					);
					break;
			}
		}
	}
}
