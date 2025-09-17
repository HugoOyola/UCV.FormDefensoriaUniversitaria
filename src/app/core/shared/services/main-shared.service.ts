import {Injectable, signal} from '@angular/core';
import {ObtenerDatosPersonales} from '../../../page/main/interface/principal';

@Injectable({
	providedIn: 'root',
})
export class MainSharedService {
	public cPerCodigo = signal<string>('');

	// % datos personales
	public datosPersonales = signal<ObtenerDatosPersonales | null>(null);
}
