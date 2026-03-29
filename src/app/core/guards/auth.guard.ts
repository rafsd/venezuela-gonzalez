import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (!auth.user()) return router.createUrlTree(['/login']);
      const role = auth.profile()?.role;
      if (!role || role === 'pending') return router.createUrlTree(['/pending']);
      if (role === 'rejected') return router.createUrlTree(['/login']);
      return true;
    })
  );
};

export const adminGuard = (): Observable<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return toObservable(auth.loading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (!auth.isAdmin()) return router.createUrlTree(['/schedule']);
      return true;
    })
  );
};
