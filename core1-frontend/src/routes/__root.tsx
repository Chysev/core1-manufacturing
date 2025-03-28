import { createRoute } from '@tanstack/react-router';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Login from '../pages/Auth/Login';
import MasterProduction from '../pages/Dashboard/MasterProduction';
import { MantineProvider } from '@mantine/core';
import DemandForecast from '../pages/Dashboard/DemandForecast';
import Products from '../pages/Dashboard/Products';
import WorkOrders from '../pages/Dashboard/WorkOrders';
import Billing from '../pages/Dashboard/Billing';
import Account from '../pages/Dashboard/Account';
import AuditRequestsPage from '../pages/Dashboard/Audit';

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


const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Login,
});

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


const AuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/audit',
  component: AuditRequestsPage,
});

const routeTree = rootRoute.addChildren([
  AuditRoute,
  LoginRoute,
  BillingRoute,
  AccountRoute,
  MaterialsRoute,
  WorkOrdersRoute,
  DemandForecastRoute,
  MasterProductionRoute,
]);

export default routeTree;
