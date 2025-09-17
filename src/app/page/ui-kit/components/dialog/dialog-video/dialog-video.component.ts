import {Component, Inject, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {fade} from 'src/app/animations';
@Component({
    selector: 'app-dialog-video',
    imports: [MatIconModule, MatButtonModule, MatDialogModule],
    templateUrl: './dialog-video.component.html',
    styleUrl: './dialog-video.component.scss',
    animations: [fade]
})
export class DialogVideoComponent {
	private dialog = inject(MatDialog);

	private dialogRef = inject(MatDialogRef<DialogVideoComponent>);
	private sanitizer = inject(DomSanitizer);
	public urlSafe?: SafeResourceUrl;
	public ling = '';

	constructor() {
		this.ling = `https://player.vimeo.com/video/837364512?h=4a07f85f8a&autoplay=0&color=ff0179&title=0&byline=0&portrait=0`;
		this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.ling);
	}

	OnClickNO(): void {
		this.dialogRef.close();
	}
	transformYourHtml(htmlTextWithStyle: string): SafeHtml {
		return this.sanitizer.bypassSecurityTrustHtml(htmlTextWithStyle);
	}
}
