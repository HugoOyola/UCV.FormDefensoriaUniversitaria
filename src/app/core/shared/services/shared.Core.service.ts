import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {from, Observable} from 'rxjs';
import {DialogComponent} from '../components/dialog/dialog.component';

@Injectable({
	providedIn: 'root',
})
export class SharedCoreService {
	private _dialog = inject(MatDialog);
	/**
	 * Mensaje Modal sharedCore
	 * @param {number}Num_Config - Numero de Switch
	 * @param {string}Mensaje  - Mensaje en string o formato html
	 * @param {Array}[ArrayData] - Contenido de array
	 */
	openDialog(Num_Config: number, Mensaje = '', ArrayData = []): Observable<any> {
		const dialogRef = this._dialog.open(DialogComponent, {
			data: {Num_Config, Mensaje, ArrayData},
			panelClass: 'custom-modalbox',
			autoFocus: false,
		});
		return from(dialogRef.afterClosed());
	}
	/**
	 * Información del navegador
	 * @returns devuelve el nombre del navegador
	 */
	getBrowserInfo(): string {
		const ua = navigator.userAgent;
		let tem;
		let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if (/trident/i.test(M[1])) {
			tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
			return `IE ${tem[1] || ''}`;
		}
		if (M[1] === 'Chrome') {
			tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
			if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
		}
		M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
		if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
		return M.join(' ');
	}
	windowScrollTo(): void {
		window.scrollTo(0, 0);
	}
}
