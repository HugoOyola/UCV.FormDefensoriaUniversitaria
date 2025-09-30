export interface CampusDU {
  nuniorgcodigo: number;
  cuniorgnombre: string;
  cperjuridica: string;
  cPerApellido: string;
  pS_ESTABID: string;
  descr: string;
}

export interface CampusDUResponse {
  lstItem: CampusDU[];
}