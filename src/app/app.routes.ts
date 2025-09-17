import { Routes } from '@angular/router';
import { MainComponent } from './page/main/main.component';

export const routes: Routes = [
	{
		path: '',
		component: MainComponent,
		title: 'Principal',
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full',
			},
			{
				path: 'dashboard',
				loadComponent: () =>
					import('./page/main/components/datos-basicos/datos-basicos.component').then((m) => m.DatosBasicosComponent),
				title: 'Libro de Reclamos - Dashboard',
			},
			{
				path: 'uikit',
				loadComponent: () =>
					import('./page/ui-kit/ui-kit.component').then((m) => m.UiKitComponent),
				title: 'UI Kit',
			},
			{
				path: '**',
				loadComponent: () =>
					import('./core/shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
				title: '404',
			},
		],
	},
];
