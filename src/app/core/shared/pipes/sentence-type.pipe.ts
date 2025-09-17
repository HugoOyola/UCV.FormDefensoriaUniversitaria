import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'sentenceType',
})
export class SentenceTypePipe implements PipeTransform {
	transform(value: string, ...args: unknown[]): unknown {
		const text: string = value.toLowerCase();
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
}
