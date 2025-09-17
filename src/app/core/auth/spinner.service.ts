import {Injectable, inject} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
	providedIn: 'root',
})
export class SpinnerService {
	private SpinnerService = inject(NgxSpinnerService);

	llamarSpinner(): void {
		this.SpinnerService.show(undefined, {
			// bdColor: 'rgba(255, 255, 255,0.2)',
			bdColor: 'rgba(0, 0, 0,0.1)',
			// type: 'ball-clip-rotate-pulse',
			size: 'medium',
			color: '#0d2e5d',
			fullScreen: true,
		});
	}
	DetenerSpinner(): void {
		this.SpinnerService.hide();
	}
}
