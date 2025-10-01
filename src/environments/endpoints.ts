export const routes = {
	TrilcePrincipalApi: {
		url: 'https://ucvapi.azure-api.net/trilceprincipal/api/',
		endpoints: {
			//% Principal
			Principal_ObtenerDatosPersonales: 'Principal/ObtenerDatosPersonales',
		},
	},
	DefensoriaUniversitaria: {
		endpoints: {
			Du_CampusDU: 'DUSevicioWeb/CampusDU',
			Du_NumeroExpedienteDU: 'DUSevicioWeb/NumeroExpedienteDU',
			Du_DepartamentosDU: 'DUSevicioWeb/DepartamentosDU',
		}
	}
};
