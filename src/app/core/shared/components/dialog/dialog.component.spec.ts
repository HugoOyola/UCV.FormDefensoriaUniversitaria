import {DialogModule} from '@angular/cdk/dialog';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatError} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {RouterTestingModule} from '@angular/router/testing';

import {DialogComponent} from './dialog.component';

describe('DialogComponent', () => {
	let component: DialogComponent;
	let fixture: ComponentFixture<DialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MatDialogModule],
			declarations: [DialogComponent],
			providers: [
				MatDialog,
				{
					provide: MatDialogRef,
					useValue: {1: Number, Mensaje: String, ['']: []},
				},
				{
					provide: MAT_DIALOG_DATA,
					useValue: {1: Number, Mensaje: String, ['']: []},
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
