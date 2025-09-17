import {Component, Inject, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {fade} from 'src/app/animations';

@Component({
    selector: 'app-dialog-card',
    imports: [MatIconModule, MatButtonModule, MatDialogModule],
    templateUrl: './dialog-card.component.html',
    styleUrl: './dialog-card.component.scss',
    animations: [fade]
})
export class DialogCardComponent {
	private dialog = inject(MatDialog);

	private dialogRef = inject(MatDialogRef<DialogCardComponent>);
	private sanitizer = inject(DomSanitizer);
	public urlSafe?: SafeResourceUrl;
	public ling = '';

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {cPerCodigo: string; Apellidos: string; Nombres: string; Escuela: string; Filial: string; Periodo: string; Dni: string}
	) {
		this.ling = `https://trilce.ucv.edu.pe/Trilceqr/${data.cPerCodigo}|${data.Apellidos}|${data.Nombres}|${data.Escuela}|${data.Filial}|${data.Periodo}|${data.Dni}`;
		this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.ling);
	}

	OnClickNO(): void {
		this.dialogRef.close();
	}
	transformYourHtml(htmlTextWithStyle: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	}
}
