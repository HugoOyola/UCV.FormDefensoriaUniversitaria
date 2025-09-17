import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '../auth/auth.service';
@Injectable({
	providedIn: 'root',
})
export class AuthGuardGuard  {
	public userDat: any;
	constructor(private _authService: AuthService) {}

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		let data$ = this._authService.validator();
		console.log('guard =>', data$);
		this._authService.redirect(data$);

		return data$;
	}
}
