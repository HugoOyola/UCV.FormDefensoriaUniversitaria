import {Injectable} from '@angular/core';
import {environment} from '@environment/environment';

@Injectable({
	providedIn: 'root',
})
export class EncryptionService {
	constructor() {}
	rand_code(chars: string, lon: number): string {
		let rand;
		let code = '';
		for (let x = 0; x < lon; x++) {
			rand = Math.floor(Math.random() * chars.length);
			code += chars.substr(rand, 1);
		}
		return code;
	}
	_code(SJson: string): string {
		const encoded = btoa(SJson);
		const text1 = this.rand_code('0123456789abcdefABCDEF?¿¡!:;', 3);
		const text2 = this.rand_code('0123456789abcdefABCDEF?¿¡!:;', 4);
		let c1 = '',
			c2 = '',
			c3 = '';
		c1 = encoded.substring(0, 3);
		c2 = encoded.substring(3, encoded.length - 2);
		c3 = encoded.substring(encoded.length - 2, encoded.length);
		return c1 + text1 + c2 + text2 + c3;
	}
	_decode(valor: string): string {
		let decode = '';
		const c1 = valor.substring(0, 3);
		const c2 = valor.substring(6, valor.length - 6);
		const c3 = valor.substring(valor.length - 2);
		valor = c1 + c2 + c3;
		try {
			decode = atob(valor);
			return decode;
		} catch (error) {
			return 'Error en la codificación';
		}
	}
	_decodeToken(valor: string, split: string, token: string): string {
		const c1 = valor.substring(0, 3);
		const c2 = valor.substring(6, valor.length - 6);
		const c3 = valor.substring(valor.length - 2);
		valor = c1 + c2 + c3;
		const decode = atob(`${valor}`).split(split);
		if (decode[1] == token) {
			return decode[0];
		}
		window.location.href = environment.redireccion;
		throw new Error('Error en decodificación');
	}
}
