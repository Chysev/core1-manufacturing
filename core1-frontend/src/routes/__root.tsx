import { createRoute } from '@tanstack/react-router';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '../pages/App';
import Login from '../pages/Auth/Login';
import MasterProduction from '../pages/Dashboard/MasterProduction';
import { MantineProvider } from '@mantine/core';
import DemandForecast from '../pages/Dashboard/DemandForecast';
import Products from '../pages/Dashboard/Products';
import WorkOrders from '../pages/Dashboard/WorkOrders';
import Billing from '../pages/Dashboard/Billing';
import Account from '../pages/Dashboard/Account';

const queryClient = new QueryClient();

export const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Outlet />
      </MantineProvider>
    </QueryClientProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: Login,
});

// Dashboard

const MasterProductionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/production',
  component: MasterProduction,
});

const DemandForecastRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/demandforecast',
  component: DemandForecast,
});

const MaterialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/products',
  component: Products,
});

const BillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/billing',
  component: Billing,
});

const WorkOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/workorders',
  component: WorkOrders,
});

const AccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/account',
  component: Account,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  LoginRoute,
  BillingRoute,
  AccountRoute,
  MaterialsRoute,
  WorkOrdersRoute,
  DemandForecastRoute,
  MasterProductionRoute,
]);

export default routeTree;
