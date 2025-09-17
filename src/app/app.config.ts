import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {tokenInterceptor} from '@auth/token.interceptor';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideClientHydration} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideAnimations(),
		provideHttpClient(withInterceptors([tokenInterceptor])),
		provideAnimationsAsync(),
	],
};
