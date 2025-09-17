import {AfterViewInit, CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
// import function to register Swiper custom elements
import {SwiperContainer, register} from 'swiper/element/bundle';
import {ObtenerPublicidad} from '../../../interface/principal';
import {interval, startWith} from 'rxjs';
import {MainService} from '../../../services/main.service';
import {MainSharedService} from '../../../../../core/shared/services/main-shared.service';
// register Swiper custom elements
register();
@Component({
    selector: 'app-dialog-noticias',
    imports: [MatIconModule, MatButtonModule, MatDialogModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [MainService],
    templateUrl: './dialog-noticias.component.html',
    styleUrl: './dialog-noticias.component.scss'
})
export class DialogNoticiasComponent implements AfterViewInit, OnInit {
	private dialogRef = inject(MatDialogRef<DialogNoticiasComponent>);
	private sanitizer = inject(DomSanitizer);
	private _mainService = inject(MainService);
	private _mainSharedService = inject(MainSharedService);
	private mando: number[] = [];

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public _data: {noticias: ObtenerPublicidad[]; deuda: {deuda: number; nombre: string; apellidos: string}}
	) {
		this.registroPublicidad();
	}
	ngOnInit(): void {
		if (this._data.deuda.deuda <= 0) {
			this.onSlideChange(0);
		} else {
			this.onSlideChange(1);
		}
	}
	ngAfterViewInit(): void {
		const swiperEl = document.querySelector('swiper-container');

		swiperEl?.addEventListener('swiperslidechange', (event: any) => {
			console.log('slide changed', event.detail[0].activeIndex);

			if (this._data.deuda.deuda <= 0) {
				this.onSlideChange(event.detail[0].activeIndex);
			} else {
				this.onSlideChange(event.detail[0].activeIndex + 1);
			}
		});

		const eventHandler = (event: any) => {
			console.log(`Event: ${event.type}`, event);
		};

		swiperEl?.addEventListener('*', eventHandler);
	}
	registroPublicidad(): void {
		this._data.noticias.forEach(() => {
			this.mando.push(0);
		});
	}
	onSlideChange(index: number): void {
		console.log(' =>', this.mando);
		console.log(' =>', this.mando[index]);
		if (this.mando[index] === 0) {
			this.mando[index] = 1;
			this._mainService
				.post_Principal_RegistrarDircomPUBLICIDAD(
					this._mainSharedService.cPerCodigo(),
					this._data.noticias[index].nPubCodigo.toString(),
					this._data.noticias[index].cPubTitulo,
					'202301',
					'popup'
				)
				.subscribe({
					next: (v) => {
						console.log('v =>', v);
					},
					error: (e) => {
						console.log('e =>', e);
					},
					complete: () => {},
				});
		}
	}
	OnClickNO(): void {
		this.dialogRef.close();
	}
	transformYourHtml(htmlTextWithStyle: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	}
	abrirUrl(url: string): void {
		console.log(' =>', url);
		if (url === '') {
			return;
		} else if (!url.includes('http') && url.includes('.pdf')) {
			window.open(`https://trilce.ucv.edu.pe/Noti/pdf/${url}`, '_blank');
		} else {
			window.open(url, '_blank');
		}
	}
}
