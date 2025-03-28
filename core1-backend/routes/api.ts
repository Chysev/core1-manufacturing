import { Router } from 'express';
import apiController from '../controllers/apiController';
import isAuthenticated from '../middleware/isAuthenticated';

const router: Router = Router();

router.get('/forecast/analysis', apiController.Analysis);

// Authentication / Account routes
router.get('/admin-session', isAuthenticated, apiController.AdminToken);
router.get('/user-list', apiController.getAccount);
router.delete('/delete-account', apiController.DeleteAccount);
router.put('/edit-account-email', apiController.EditAccountEmail);

// Product routes
router.get('/products/list', apiController.getAllProducts);
router.post('/product/create', apiController.createProduct);
router.get('/product/:id', apiController.getProductById);
router.patch('/product/:id', apiController.updateProduct);
router.delete('/product/:id', apiController.deleteProduct);

// Production Schedule routes
router.get('/prodSched/list', apiController.getAllSchedules);
router.post('/prodSched/create', apiController.createSchedule);
router.get('/prodSched/:id', apiController.getScheduleById);
router.patch('/prodSched/:id', apiController.updateSchedule);
router.delete('/prodSched/:id', apiController.deleteSchedule);

// Work Order routes
router.get('/workOrders/list', apiController.getAllWorkOrders);
router.post('/workOrders/create', apiController.createWorkOrder);
router.get('/workOrders/:id', apiController.getWorkOrderById);
router.patch('/workOrders/:id', apiController.updateWorkOrder);
router.delete('/workOrders/:id', apiController.deleteWorkOrder);

// Material routes
router.get('/materials/list', apiController.getAllMaterials);
router.post('/materials/create', apiController.createMaterial);
router.get('/materials/:id', apiController.getMaterialById);
router.patch('/materials/:id', apiController.updateMaterial);
router.delete('/materials/:id', apiController.deleteMaterial);

// Demand Forecast routes
router.get('/forecast/list', apiController.getAllForecasts);
router.post('/forecast/create', apiController.createForecast);
router.get('/forecast/:id', apiController.getForecastById);
router.patch('/forecast/:id', apiController.updateForecast);
router.delete('/forecast/:id', apiController.deleteForecast);



export default router;
