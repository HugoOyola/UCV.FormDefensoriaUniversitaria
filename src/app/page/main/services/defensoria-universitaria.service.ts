import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { ResponseResultLst, ResponseResultItem } from '@interface/responseResult.interface';
import { GlobalService } from '@shared/services/global.service';
import { Observable } from 'rxjs';
import { CampusDU } from '../interface/campus.interface';
import { ExpedienteDU } from '../interface/expediente.interface';
import { DepartamentoDU } from '../interface/departamento.interface';
import { ModalidadDU } from '../interface/modalidad.interface';
import { UnidadAcademicaDU } from '../interface/unidad-academica.interface';

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
    return this._http.get<ResponseResultLst<CampusDU>>(url, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }

  /**
   * Obtiene el número de expediente para una filial específica
   * @param cperjuridica Código de persona jurídica de la filial
   * @returns Observable con la respuesta de la API
   */
  post_NumeroExpedienteDU(cperjuridica: string): Observable<HttpResponse<ResponseResultItem<ExpedienteDU>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_NumeroExpedienteDU;
    const body = { cperjuridica };

    return this._http.post<ResponseResultItem<ExpedienteDU>>(url, body, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }

  /**
   * Obtiene los departamentos/áreas para una filial específica
   * @param estabid Código de establecimiento de la filial (pS_ESTABID)
   * @returns Observable con la respuesta de la API
   */
  post_DepartamentosDU(estabid: string): Observable<HttpResponse<ResponseResultLst<DepartamentoDU>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_DepartamentosDU;
    const body = { estabid };

    return this._http.post<ResponseResultLst<DepartamentoDU>>(url, body, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }

  /**
   * Obtiene el listado de modalidades
   * @returns Observable con la respuesta de la API
   */
  get_ModalidadesDU(): Observable<HttpResponse<ResponseResultLst<ModalidadDU>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_ModalidadesDU;
    return this._http.get<ResponseResultLst<ModalidadDU>>(url, {
      headers: this.headers_a_json,
      observe: 'response'
    });
  }

  /**
   * Obtiene las unidades académicas (escuelas profesionales) para una filial específica
   * @param cperjuridica Código de persona jurídica de la filial
   * @returns Observable con la respuesta de la API
   */
  post_UnidadesAcademicasDU(cperjuridica: string): Observable<HttpResponse<ResponseResultLst<UnidadAcademicaDU>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_UnidadesAcademicasDU;
    const body = { cperjuridica };

    return this._http.post<ResponseResultLst<UnidadAcademicaDU>>(url, body, {
      headers: this.headers_a_json,
      observe: 'response',
    });
  }

  /**
   * Registra un expediente de denuncia o reclamo
   * @param data Datos del expediente a registrar
   * @returns Observable con la respuesta de la API
   */
  post_RegistrarExpedienteDU(formData: FormData): Observable<HttpResponse<ResponseResultItem<any>>> {
    const url = this.ApiDefensoriaUniversitaria.url + this.ApiDefensoriaUniversitaria.endpoints.Du_RegistrarExpedienteDU;

    return this._http.post<ResponseResultItem<any>>(url, formData, {
      observe: 'response',
    });
  }
}