import { HttpInterceptorFn } from '@angular/common/http';
import {SpinnerService} from './spinner.service';
import {AuthService} from './auth.service';
import {inject} from '@angular/core';
import {environment} from '@environment/environment';
import {catchError, finalize, switchMap, throwError, timer} from 'rxjs';

const tokenUrls = Object.values(environment.ls_apis).map((api) => api.token.tokenUrl);
const listUrl = [environment.ip, ...tokenUrls];

let requestCount = 0;

export const tokenInterceptor: HttpInterceptorFn = (request, next) => {
	const _spinnerService = inject(SpinnerService);
	const _authService = inject(AuthService);
	//* Cofiguraciones
	const MAXIMO_INTENTOS = environment.configInterceptor.MAXIMO_INTENTOS;
	const TIEMPO_ESPERA_MS = environment.configInterceptor.TIEMPO_ESPERA_MS;
	console.log('🔗 interceptor =>', request.url);
	// console.log('listUrl =>', listUrl);
	// console.log('listUrl =>', req.url);
	// % Spinner Loading
	const shouldShowSpinner = request.params.has('showSpinner') ? request.params.get('showSpinner') === 'true' : true;
	if (listUrl.includes(request.url)) {
		return next(request).pipe(
			catchError((err) => {
				return throwError(() => err);
			})
		);
	} else {
		if (shouldShowSpinner) {
			requestCount++;
			_spinnerService.llamarSpinner();
		}
		const _apis = obtenerDominio(request.url);
		if (_apis && environment.local == false) {
			request = request.clone({
				setHeaders: {
					authorization: `Bearer ${localStorage.getItem(`token_${_apis.name}`)}`,
				},
			});
			let intentos = 0;
			return next(request).pipe(
				catchError((error, caught) => {
					if ((error.status !== 500 && error.status !== 401 && error.status !== 503) || intentos === MAXIMO_INTENTOS) {
						return throwError(() => error);
					}
					if (error.status === 500 || error.status === 503) {
						return next(request).pipe(
							catchError((err, cau) => {
								if (intentos === MAXIMO_INTENTOS) {
									return throwError(() => error);
								}
								intentos++;
								return timer(TIEMPO_ESPERA_MS).pipe(switchMap(() => cau));
							})
						);
					}
					if (error.status == 401) {
						return _authService.getToken(_apis.tokenUrl, _apis.user, _apis.pass).pipe(
							switchMap((data: any) => {
								_authService.setItem(_apis.name, data.expires_in, data.access_token);
								request = request.clone({
									setHeaders: {
										authorization: `Bearer ${localStorage.getItem(`token_${_apis.name}`)}`,
									},
								});
								return next(request);
							}),
							catchError((err) => {
								return throwError(() => err);
							})
						);
					}
					intentos++;
					return timer(TIEMPO_ESPERA_MS).pipe(switchMap(() => caught));
				}),
				finalize(() => {
					if (shouldShowSpinner) {
						requestCount--;
						if (requestCount <= 0) {
							_spinnerService.DetenerSpinner();
						}
					}
				})
			);
		} else {
			request = request.clone({
				setHeaders: {
					// authorization: 'Bearer ' + localStorage.getItem('token_api'),
				},
			});
			let valu = 0;
			return next(request).pipe(
				catchError((error, caught) => {
					if ((error.status !== 500 && error.status !== 401 && error.status !== 503) || valu == MAXIMO_INTENTOS) {
						return throwError(() => error);
					}
					valu++;
					return timer(TIEMPO_ESPERA_MS).pipe(switchMap(() => caught));
				}),
				finalize(() => {
					if (shouldShowSpinner) {
						requestCount--;
						if (requestCount <= 0) {
							_spinnerService.DetenerSpinner();
						}
					}
				})
			);
		}
	}
};
function obtenerDominio(url: string): {
	name: string;
	user: string;
	pass: string;
	tokenUrl: string;
} | null {
	let data;
	const regex = /^https?:\/\/[^/]+\/([^/]+)/;
	const match = url.match(regex);
	const urlGlobal = match ? match[1] : '';
	// console.log(' =>', urlGlobal);
	if (environment.local) {
		return {
			name: '',
			user: '',
			pass: '',
			tokenUrl: '',
		};
	} else {
		for (const api of Object.values(environment.ls_apis)) {
			// console.log(' =>', api);
			const routeKeys = Object.keys(api.routes);
			for (const routeKey of routeKeys) {
				// console.log(' =>', routeKey);
				if (urlGlobal === routeKey) {
					data = api.token;
					// console.log(' =>', api.token);
					return data;
				}
			}
		}
	}
	return null;
}
