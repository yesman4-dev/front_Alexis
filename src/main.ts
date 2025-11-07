/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Chart } from 'chart.js';
import { AppModule } from './app/app.module';
import { registerables } from 'chart.js';

Chart.register(...registerables);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
