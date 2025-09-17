import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {SkeletonComponent} from '@shared/components/skeleon/skeleton.component';
import {MainSharedService} from '@shared/services/main-shared.service';
import {PerfilesSharedService} from '@shared/services/perfiles-shared.service';
import {centrosEmpre} from '../../interface/principal';

@Component({
    selector: 'app-datos-basicos',
    imports: [SkeletonComponent, MatIconModule, MatButtonModule],
    templateUrl: './datos-basicos.component.html',
    styleUrl: './datos-basicos.component.scss'
})
export class DatosBasicosComponent {
	public _mainSharedService = inject(MainSharedService);
	public _perfilesSharedService = inject(PerfilesSharedService);

	public icons = [
		{svg: 'g-calendar', url: 'http://www.google.com/calendar/hosted/ucvvirtual.edu.pe'},
		{svg: 'gmail', url: 'http://mail.google.com/a/ucvvirtual.edu.pe'},
		{svg: 'g-docs', url: 'https://docs.google.com/a/ucvvirtual.edu.pe'},
		{svg: 'g-drive', url: 'https://drive.google.com/a/ucvvirtual.edu.pe'},
		{svg: 'g-keep', url: 'https://keep.google.com/u/0/'},
	];

	AbrirCentros(data: centrosEmpre): void {
		console.log('☺☺☺😚 =>', data);
		window.parent.postMessage(
			{
				nombre: data.nombre,
				titulo: data.titulo,
				cPerJuridica: data.primercodigo,
				opcion: data.segundocodigo,
				nTipCur: data.tercercodigo,
				flagventana: data.cuartocodigo,
			},
			'*'
		);
	}
}
