import {Injectable, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {EncryptionService} from '@auth/encryption.service';
import {environment} from '@environment/environment';
import {MainSharedService} from '@shared/services/main-shared.service';
import {PerfilesSharedService} from '@shared/services/perfiles-shared.service';
interface DatosModuloNew {
	url: string;
	data: Partial<{type: 'TrilceUCV'; data: object}>;
}
@Injectable({
	providedIn: 'root',
})
export class ModuleService {
	public _mainSharedService = inject(MainSharedService);
	public _encryptionService = inject(EncryptionService);
	public _perfilesSharedService = inject(PerfilesSharedService);
	private _router = inject(Router);
	// * Modulos Data Signal
	// public datosModuloSignal = signal<DatosModulo>({
	// 	url: '',
	// 	data: [],
	// });
	// actualizarDatosModulo(mainSharedNew: Partial<DatosModulo>): void {
	// 	this.datosModuloSignal.update((prev) => {
	// 		return {...prev, ...mainSharedNew};
	// 	});
	// }
	// * Modulos Data Signal New
	public datosModuloSignal = signal<DatosModuloNew>({
		url: '',
		data: {},
	});
	actualizarDatosModulo(DatosModuloNew: Partial<DatosModuloNew>): void {
		this.datosModuloSignal.update((prev) => {
			return {...prev, ...DatosModuloNew};
		});
	}

	// * Abrir Modulo

	abrirModulo(moduloPro: string, moduloQa: string): void {
		let url = '';
		if (environment.production) {
			url = moduloPro;
		} else {
			url = moduloQa;
		}
		this.actualizarDatosModulo({url: url});
		this._router.navigate(['/modulo']);
	}
	// * Matricula Administrativa
	abrirMatriculaAdmin(AccesoRegular: 'regular' | 'especial'): void {
		let url = '';
		if (environment.production) {
			url = 'https://ucv-matricula-admin.azurewebsites.net/';
		} else {
			// url = 'https://ucv-matricula-admin-qa.azurewebsites.net/';
			url = 'http://localhost:7000/';
		}
		const cPerCodigo = this._mainSharedService.cPerCodigo();
		const token = 'this._mainSharedService.token()';
		const user_Perfil = this._perfilesSharedService.user_Perfil();
		const cPerNombre = this._mainSharedService.datosPersonales()?.cPerNombre || '';
		const cPerApellido = this._mainSharedService.datosPersonales()?.cPerApellido || '';

		this.actualizarDatosModulo({
			url: url,
			data: {
				type: 'TrilceUCV',
				data: {
					AccesoRegular: this._encryptionService._code(AccesoRegular),
					cPerCodigo: this._encryptionService._code(cPerCodigo),
					tokenR: this._encryptionService._code(token),
					perfiles: this._encryptionService._code(user_Perfil),
					CPerApellido: this._encryptionService._code(cPerApellido),
					CPerNombre: this._encryptionService._code(cPerNombre),
				},
			},
		});
		this._router.navigate(['/modulo']);
	}
}
