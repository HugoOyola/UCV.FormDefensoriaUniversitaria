import {Injectable, signal} from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class PerfilesSharedService {
	public tienePerfiles = signal<boolean>(false);
	public user_Perfil = signal<string>('');

	public Alumno = signal<boolean>(false);
	public Docente = signal<boolean>(false);
	public Administrativo = signal<boolean>(false);
	public Padre = signal<boolean>(false);
	public Administrador = signal<boolean>(false);
	public Alfa = signal<boolean>(false);
	public Ul = signal<boolean>(false);
	public Egresado = signal<boolean>(false);
	actualizarPerfiles(perfiles: string): void {
		console.log('perfiles =>', perfiles);
		const perf = perfiles.split(',');
		console.log('perfiles =>', perf);

		this.Alumno.set(perf.includes('13'));
		this.Docente.set(perf.includes('12'));
		this.Administrativo.set(perf.includes('21'));
		this.Padre.set(perf.includes('16'));
		this.Administrador.set(perf.includes('15'));
		this.Alfa.set(perf.includes('196'));
		this.Ul.set(perf.includes('204'));
		this.Egresado.set(perf.includes('14'));
	}
	sinPermisos(): void {
		this.Alumno.set(false);
		this.Docente.set(false);
		this.Administrativo.set(false);
		this.Padre.set(false);
		this.Administrador.set(false);
		this.Alfa.set(false);
		this.Ul.set(false);
		this.Egresado.set(false);
	}
}
// (case when @alumno=0 then '0' else '13' end)  +','+
// (case when @Docente=0 then '0' else '12' end)+','+
// (case when @Administrativo=0 then '0' else '21' end)+','+
// (case when @Padre=0 then '0' else '16' end)+','+
// (case when @administrador=0 then '0' else '15' end) +','+
// (case when @Alfa=0 then '0' else '196' end) +','+
// (case when @ul=0 then '0' else '204' end) + ',' +
// (case when @Egresado=0 then '0' else '14' end) as Niveles
