import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
  name: string;
  icon?: any;
  current: boolean;
  main_component: any;
  path: string;
};

export const DEFAULT_MAIN_CONTENT = 'DASHBOARD';
export const APP_NAVIGATION = [
  {
    key: 'DASHBOARD',
    name: 'Dashboard',
    icon: PresentationChartLineIcon,
    current: false,
    main_component: Dashboard,
    path: '/',
  },
  {
    key: 'PURCHASES',
    name: 'Purchases',
    icon: ShoppingBagIcon,
    current: false,
    main_component: Purchases,
    path: '/purchases',
  },
  {
    key: 'HEADCOUNT',
    name: 'Headcount',
    icon: UserGroupIcon,
    current: false,
    main_component: Headcount,
    path: '/headcount',
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
