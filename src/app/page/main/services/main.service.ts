import { HttpResponse } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@environment/environment';
import {ResponseResultLst} from '@interface/responseResult.interface';
import {GlobalService} from '@shared/services/global.service';
import {Observable} from 'rxjs';
import {ObtenerDatosPersonales} from '../interface/principal';

@Injectable()
export class MainService extends GlobalService {
	private TrilcePrincipal = environment.ls_apis.trilceapi2.routes.TrilcePrincipalApi;

	constructor() {
		super();
	}
	// params: {showSpinner: false},
	post_Principal_ObtenerDatosPersonales(cPerCodigo: string): Observable<HttpResponse<ResponseResultLst<ObtenerDatosPersonales>>> {
		const param = {cPerCodigo};
		const ling = this.TrilcePrincipal.url + this.TrilcePrincipal.endpoints.Principal_ObtenerDatosPersonales;
		return this._http.post<ResponseResultLst<ObtenerDatosPersonales>>(ling, param, {
			headers: this.headers_a_json,
			observe: 'response',
		});
	}
}
