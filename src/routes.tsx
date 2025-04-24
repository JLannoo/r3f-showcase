import { lazy } from 'react';
import { Navigate, RouteProps } from 'react-router';

const Index = lazy(() => import('./pages/Index/Index'));

export const routes: RouteProps[] = [
  { path: '*', element: <Navigate to="/" /> },
  { path: '/', element: <Index /> },
];
