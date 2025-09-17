import {Routes} from '@angular/router';
import {ModulosComponent} from './page/module/modulos.component';
import {MainComponent} from './page/main/main.component';

export const routes: Routes = [
	{
		path: '',
		component: MainComponent,
		// loadComponent: () => import('./page/main/main.component').then((m) => m.MainComponent),
		title: 'Modulo Datos - Principal',
		children: [
			{
				path: 'modulo',
				component: ModulosComponent,
				// loadComponent: () => import('./page/main/main.component').then((m) => m.MainComponent),
				title: 'Modulo Datos - Principal',
			},
			{
				path: 'uikit',
				loadComponent: () => import('./page/ui-kit/ui-kit.component').then((m) => m.UiKitComponent),
				title: 'Modulo Datos - Principal',
			},
			{
				path: '**',
				loadComponent: () => import('./core/shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
				title: '404',
			},
		],
	},
	{
		path: 'modulo',
		component: ModulosComponent,
		// loadComponent: () => import('./page/main/main.component').then((m) => m.MainComponent),

		title: 'Modulo Datos - Principal',
	},
	{
		path: 'uikit',
		loadComponent: () => import('./page/ui-kit/ui-kit.component').then((m) => m.UiKitComponent),

		title: 'Modulo Datos - Principal',
	},
	{
		path: '**',
		loadComponent: () => import('./core/shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
		title: '404',
	},
];
