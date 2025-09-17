import {NgClass, NgStyle} from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-skeleton',
    imports: [NgClass, NgStyle],
    templateUrl: './skeleton.component.html',
    styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent implements OnInit {
	@Input() public count = 1;
	@Input() public gap = {gap: '0.25rem'};
	@Input() public direccion: 'row' | 'col' = 'row';
	@Input() public appearance: 'circle' | 'rounded' | 'rectangle' | 'square' | 'table' = 'square';
	@Input() public tableRow: number = 5;
	@Input() public tableCol: number = 2;
	@Input() public theme: any = {width: '200px', height: '18px'};
	public repeat: number[] = [];
	public tableRowArray: number[] = [];
	public tableColArray: number[] = [];
	public countArray: number[] = [];
	constructor() {}

	ngOnInit(): void {
		this.tableRowArray = Array.from({length: this.tableRow}, (_, i) => i);
		this.tableColArray = Array.from({length: this.tableCol}, (_, i) => i);
		this.countArray = Array.from({length: this.count}, (_, i) => i);
	}
}
