import {animate, keyframes, query, state, style, transition, trigger} from '@angular/animations';

export const fade = trigger('fade', [
	transition(':enter', [
		query('void', [animate('0.3s ease-in', style({opacity: 0}))], {optional: true}),

		animate(
			'0.5s ease-out',
			keyframes([
				style({opacity: 0, transform: 'scale(1)', offset: 0}),
				style({opacity: 0, transform: 'scale(0.5)', offset: 0.1}),
				style({opacity: 1, transform: 'scale(1)', offset: 0.7}),
				style({opacity: 1, transform: 'scale(0.97)', offset: 0.9}),
				style({opacity: 1, transform: 'scale(1)', offset: 1}),
			])
		),
	]),
	state('*', style({opacity: 1})),
	state('void', style({opacity: 0})),
	// transition(':leave', animate('0.3s ease-in', keyframes([style({opacity: 1, offset: 0}), style({opacity: 0, offset: 1})]))),
	// transition(
	// 	':leave',
	// 	animate(
	// 		'0.5s ease-out',
	// 		keyframes([
	// 			style({opacity: 1, transform: 'scale(1)', offset: 0}),
	// 			style({opacity: 1, transform: 'scale(0.97)', offset: 0.1}),
	// 			style({opacity: 1, transform: 'scale(1)', offset: 0.5}),
	// 			style({opacity: 0, transform: 'scale(0.5)', offset: 0.9}),
	// 			style({opacity: 0, transform: 'scale(1)', offset: 1}),
	// 		])
	// 	)
	// ),
]);
export const fade2 = trigger('fade2', [
	transition('void => *', [
		style({
			opacity: 0,
			transform: 'scale(0.9)',
		}),
		animate(
			'0.5s ease-in-out',
			style({
				opacity: 0,
			})
		),
		animate(
			'0.2s ease-in',
			style({
				transform: 'scale(1.02)',
				opacity: 1,
			})
		),
		animate(
			'0.1s ease-out',

			style({
				transform: 'scale(1)',
			})
		),
	]),
]);
export const detailExpand = trigger('detailExpand', [
	state('collapsed', style({height: '0px', minHeight: '0', opacity: '0', overflow: 'hidden'})),
	state('expanded', style({height: '*'})),
	transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
]);
