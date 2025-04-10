import { Route, Routes } from 'react-router-dom';
import {
  PresentationChartLineIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Purchases from '../modules/purchases/components';
import Headcount from '../modules/headcount/components';
import Dashboard from '../modules/dashboard/components';

export type app_navigation_option = {
  key: string;
  name_en: string;
  name_es: string;
  name_pt: string;
  icon?: any;
  current: boolean;
  main_component: any;
  path: string;
  countries: string[];
};

export const DEFAULT_MAIN_CONTENT = 'DASHBOARD';
export const DEFAULT_COUNTRY = 'USA';
export const APP_NAVIGATION = [
  {
    key: 'DASHBOARD',
    name_en: 'Dashboard',
    name_es: 'Resumen',
    name_pt: 'Resumo',
    icon: PresentationChartLineIcon,
    current: false,
    main_component: Dashboard,
    path: '/',
    countries: ['MEX', 'USA', 'BRL'],
  },
  {
    key: 'PURCHASES',
    name_en: 'Purchases',
    name_es: 'Compras',
    name_pt: 'Compras',
    icon: ShoppingBagIcon,
    current: false,
    main_component: Purchases,
    path: '/purchases',
    countries: ['MEX', 'USA', 'BRL'],
  },
  {
    key: 'HEADCOUNT',
    name_en: 'Headcount',
    name_es: 'Headcount',
    icon: UserGroupIcon,
    current: false,
    main_component: Headcount,
    path: '/headcount',
    countries: ['USA'],
  },
];

export default function AppRoutes() {
  return (
    <Routes>
      {APP_NAVIGATION.map((route, route_num) => (
        <Route
          key={route_num}
          path={route.path}
          element={<route.main_component />}
        />
      ))}
    </Routes>
  );
}
