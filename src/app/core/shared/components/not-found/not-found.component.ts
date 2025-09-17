import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {Router} from '@angular/router';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    imports: [MatButtonModule]
})
export class NotFoundComponent {
	private _router = inject(Router);

	atras(): void {
		this._router.navigate(['/']);
	}
}
