import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {SkeletonComponent} from '@shared/components/skeleon/skeleton.component';
import {MatDividerModule} from '@angular/material/divider';
import {SharedCoreService} from '@shared/services/shared.Core.service';
import {IpService} from '@auth/ip.service';
import {MatDialog} from '@angular/material/dialog';
import {DialogVideoComponent} from './components/dialog/dialog-video/dialog-video.component';
import {from} from 'rxjs';
import {MatProgressBarModule} from '@angular/material/progress-bar';
@Component({
    selector: 'app-ui-kit',
    imports: [SkeletonComponent, MatButtonModule, MatDividerModule, MatIconModule, MatProgressBarModule],
    templateUrl: './ui-kit.component.html',
    styleUrl: './ui-kit.component.scss'
})
export class UiKitComponent {
	public _sharedCoreService = inject(SharedCoreService);
	public _ipService = inject(IpService);
	private _dialog = inject(MatDialog);

	// constructor( public _ipServsice :IpService ) {}
	openDialog(text: string): void {
		this._sharedCoreService.openDialog(1, text);
		console.log('openDialog');
	}
	openDialogResponse(): void {
		this._sharedCoreService.openDialog(2, 'Desea aprobar').subscribe({
			next: (v) => {
				console.log('v =>', v);
				if (v) {
					this.openDialog('Si');
				}
			},
			error: (e) => {
				console.log('e =>', e);
			},
			complete: () => {},
		});
	}
	openDialogVideo(): void {
		// const deuda = {
		// 	nombre: this._mainSharedService.datosPersonales()?.cPerNombre,
		// 	apellidos: this._mainSharedService.datosPersonales()?.cPerApellido,
		// 	deuda: this._mainSharedService.deuda(),
		// };
		const dialogRef = this._dialog.open(DialogVideoComponent, {
			// data: {noticias, deuda},
			panelClass: ['custom-modalbox', 'paddingSmall'],
			autoFocus: false,
			disableClose: true,
		});
		from(dialogRef.afterClosed());
	}
}
