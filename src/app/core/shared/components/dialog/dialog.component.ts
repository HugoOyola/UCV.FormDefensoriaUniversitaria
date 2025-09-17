import {Component, Inject, inject, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SharedCoreService} from '../../services/shared.Core.service';
import {fade} from 'src/app/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
    animations: [fade],
    imports: [MatIconModule, MatButtonModule, MatDialogClose]
})
export class DialogComponent implements OnInit {
	private dialog = inject(MatDialog);
	private _SharedCoreService = inject(SharedCoreService);
	private dialogRef = inject(MatDialogRef<DialogComponent>);
	private sanitizer = inject(DomSanitizer);

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {Num_Config: number; Mensaje: string; ArrayData: any}
	) {}

	ngOnInit(): void {
		if (this.data.Num_Config == 3) {
			console.log('D- mensaje  =>', this.data.Mensaje);
		}
	}
	OnClickNO(): void {
		this.dialogRef.close();
	}
	transformYourHtml(htmlTextWithStyle: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	}
}
