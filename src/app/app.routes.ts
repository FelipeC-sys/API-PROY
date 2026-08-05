import { Routes } from '@angular/router';

// Las rutas de cada feature (auth, tickets, users) se irán agregando
// con lazy loading en los siguientes commits.
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];