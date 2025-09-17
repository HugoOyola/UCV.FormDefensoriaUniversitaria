import {Component, ElementRef, HostListener, ViewChild, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {Location} from '@angular/common';

import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {fade} from 'src/app/animations';
import {ModuleService} from '@shared/services/module.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-modulos',
    imports: [MatIconModule, MatButtonModule],
    templateUrl: './modulos.component.html',
    styleUrl: './modulos.component.scss',
    animations: [fade]
})
export class ModulosComponent {
	@ViewChild('iframe', {static: false}) public iframe!: ElementRef;
	private sanitizer = inject(DomSanitizer);
	private location = inject(Location);

	private _moduleService = inject(ModuleService);
	private _router = inject(Router);
	public urlSafe?: SafeResourceUrl;
	public ling = '';

	constructor() {
		this.ling = this._moduleService.datosModuloSignal().url;
		console.log(' =>', this.ling);
		if (this.ling == '') {
			this._router.navigateByUrl('/');
		}
		this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.ling);
	}

	// transformYourHtml(htmlTextWithStyle: string): SafeHtml {
	// 	return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	// }
	volverAtras(): void {
		this._router.navigateByUrl('/');

		// this.location.back();
	}
	iframeLoaded(): void {
		if (this.iframe && this.iframe.nativeElement.contentWindow) {
			const data = this._moduleService.datosModuloSignal().data;
			console.log(' =>', data);
			if (data) {
				this.iframe.nativeElement.contentWindow.postMessage({...data}, '*');
			}
		}
	}

	// ngAfterViewInit(): void {
	// 	console.log('😎😋 =>');
	// 	window.addEventListener('message', (event) => {
	// 		console.log('😎😋 =>', event.data);
	// 		if (event.data == 'listo') {
	// 			this.iframeLoaded();
	// 		}
	// 	});
	// }

	@HostListener('window:message', ['$event'])
	onMessage(event: MessageEvent): void {
		console.log('😎😎Evento =>', event.data);
		if (event.data.type == 'TrilceUcvIframe') {
			this.iframeLoaded();
		}
	}
}
