import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {forkJoin, Observable, retry} from 'rxjs';
import {environment} from '@environment/environment';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private _http = inject(HttpClient);

	constructor() {}
	getToken(tokenUrl: string, user: string, pass: string): Observable<any> {
		const token = btoa(`${user}:${pass}`);
		const header = new HttpHeaders({
			Authorization: `Basic ${token}`,
		});
		return this._http.post(tokenUrl, null, {headers: header});
	}
	setItem(name: string, expires_in: number, access_token: string): void {
		const momentoActual = new Date();
		const addtime = expires_in;
		momentoActual.setSeconds(addtime);
		localStorage.setItem(`token_${name}`, access_token);
		localStorage.setItem(`expires_${name}`, `${momentoActual}`);
	}

	ReloadToken(): Observable<any> {
		const observables: Observable<object>[] = [];
		// console.log('value =>', Object.values(environment.ls_apis));
		Object.values(environment.ls_apis).forEach((api) => {
			if (api.token.user !== '' && api.token.pass !== '') {
				observables.push(this.Tokens(api.token.name, api.token.user, api.token.pass, api.token.tokenUrl));
			}
		});
		// console.log('obs  =>', observables);

		return forkJoin(observables);
	}

	Tokens(name: string, user: string, pass: string, tokenUrl: string): Observable<any> {
		const ob$ = new Observable<object>((apiToken_observer) => {
			// console.log('api  =>', name, user, pass, tokenUrl);
			const localStorage_token = localStorage.getItem(`token_${name}`);
			const fechaExpire = new Date(`${localStorage.getItem(`expires_${name}`)}`);
			const fechaActual = new Date();
			if (localStorage_token && fechaActual < fechaExpire) {
				apiToken_observer.complete();
			} else {
				this.getToken(tokenUrl, user, pass)
					.pipe(retry({count: environment.configInterceptor.MAXIMO_INTENTOS, delay: environment.configInterceptor.TIEMPO_ESPERA_MS}))
					.subscribe({
						next: (v) => {
							this.setItem(name, v.expires_in, v.access_token);
							apiToken_observer.complete();
						},
						error: (e) => {
							console.log(`Error Token ${name} =>`, e);
							window.location.reload();
						},
						complete: () => {},
					});
				// .subscribe((data) => {
				// 	this.setItem(name, data.expires_in, data.access_token);
				// 	apiToken_observer.complete();
				// });
			}
		});
		return ob$;
	}
}
