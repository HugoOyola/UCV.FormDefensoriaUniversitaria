import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
@Injectable({
	providedIn: 'root',
})
export class GlobalService {
	public _http = inject(HttpClient);

	public headers_a_form = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
	public headers_a_json = new HttpHeaders().set('Content-Type', 'application/json');
}
