import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { ResponseResultLst } from '@interface/responseResult.interface';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { CampusDU } from '../interface/campus.interface';

@Injectable({
  providedIn: 'root'
})
export class DefensoriaUniversitariaService extends GlobalService {
  private ApiDefensoriaUniversitaria = environment.ls_apis.DefensoriaUniversitaria.routes.defensoriaUniversitaria;

  constructor() {
    super();
  }

  /**
   * Obtiene el listado de campus/filiales de la Defensoría Universitaria
   * @returns Observable con la respuesta de la API
   */
  post_CampusDU(): Observable<HttpResponse<ResponseResultLst<CampusDU>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_CampusDU;
    return this._http.post<ResponseResultLst<CampusDU>>(url, {}, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }
}