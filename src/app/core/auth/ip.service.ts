import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../../environments/environment.development';
interface IpResponse {
	ip: string;
}
@Injectable({
	providedIn: 'root',
})
export class IpService {
	// * Datos compartidos
	private ip = new BehaviorSubject('');
	private ipUrl: string = environment.ip;
	private headers = new HttpHeaders().set('Content-Type', 'application/json');
	private _http = inject(HttpClient);
	constructor() {
		const valor = localStorage.getItem(btoa('ip'));
		if (valor && atob(valor) !== '1.1.1.1') {
			this.ip.next(atob(valor));
		} else {
			this.httpGetIp();
			localStorage.setItem(btoa('ip'), btoa('1.1.1.1'));
			this.ip.next('1.1.1.1');
		}
	}
	private getHttpIp(): Observable<IpResponse> {
		return this._http.get<IpResponse>(this.ipUrl);
	}

	getIp(): string {
		const valor = localStorage.getItem(btoa('ip'));
		if (valor && atob(valor) !== '1.1.1.1') {
			this.ip.next(atob(valor));
		} else {
			this.httpGetIp();
		}
		return this.ip.getValue();
	}

	private httpGetIp(): void {
		this.getHttpIp().subscribe({
			next: (v) => {
				localStorage.setItem(btoa('ip'), btoa(v.ip));
				this.ip.next(v.ip);
			},
			error: () => {
				localStorage.setItem(btoa('ip'), btoa('1.1.1.1'));
				this.ip.next('1.1.1.1');
			},
		});
	}
}
