import {
  PresentationChartLineIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Purchases from '../components/purchases';
import Headcount from '../components/headcount';
import Dashboard from '../components/dashboard';

export const DEFAULT_MAIN_CONTENT = 'DASHBOARD';
export const LOGIN_NEEDED = false;

export type app_navigation_option = {
  key: string;
  name: string;
  icon?: any;
  current: boolean;
  main_component: any;
};
export const APP_NAVIGATION = [
  {
    key: 'DASHBOARD',
    name: 'Dashboard',
    icon: PresentationChartLineIcon,
    current: false,
    main_component: Dashboard,
  },
  {
    key: 'PURCHASES',
    name: 'Purchases',
    icon: ShoppingBagIcon,
    current: false,
    main_component: Purchases,
  },
  {
    key: 'HEADCOUNT',
    name: 'Headcount',
    icon: UserGroupIcon,
    current: false,
    main_component: Headcount,
  },
];
