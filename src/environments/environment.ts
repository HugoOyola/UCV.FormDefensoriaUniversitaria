import {routes} from './endpoints';
export const environment = {
	production: true,
	local: false,
	configInterceptor: {
		MAXIMO_INTENTOS: 10,
		TIEMPO_ESPERA_MS: 3000,
	},

	// *Api Ip
	ip: 'https://api.ipify.org/?format=json',

	// *Api redireccio
	redireccion: 'https://trilce.ucv.edu.pe/default.aspx',

	// *Apis
	ls_apis: {
		trilceapi2: {
			token: {
				name: 'trilceapi2',
				user: 'og5xgX458yx8pDVB5UpWgNabxL8a',
				pass: '7RluNM9ox3T1UR7xOv0EONCo4Nka',
				tokenUrl: 'https://trilceapi2.ucv.edu.pe:8243/token?grant_type=client_credentials',
			},
			routes: {
				TrilcePrincipalApi: {
					...routes.TrilcePrincipalApi,
				},
			},
		},
	},
};
