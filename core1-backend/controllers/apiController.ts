import {
  TokenService,
  UserListService,
  AdminTokenService,
  getAllForecasts,
  getForecastById,
  updateForecast,
  deleteForecast,
  getAllMaterials,
  getMaterialById,
  createForecast,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getWorkOrderById,
  DeleteAccountService,
  EditAccountEmailService,
  getAccount,
} from '../services/ApiServices/apiServices';
import { Request, Response } from '../types/express-types';
import asyncHandler from './asyncHandler';

const apiController = {
  Token: asyncHandler(async (req: Request, res: Response) => {
    const account = await TokenService(req, res);
    return res.status(200).json(account);
  }),

  AdminToken: asyncHandler(async (req: Request, res: Response) => {
    await AdminTokenService(req, res);
    // return res.status(200).json(account);
  }),

  UserList: asyncHandler(async (req: Request, res: Response) => {
    const accounts = await UserListService();
    if (accounts) {
      return res.status(200).json(accounts);
    } else {
      return res.status(404).json({ error: 'Account Not Found' });
    }
  }),

  DeleteAccount: asyncHandler(async (req: Request, res: Response) => {
    await DeleteAccountService(req, res);
    return res.status(200).send('Account Deleted Successfully');
  }),

  EditAccountEmail: asyncHandler(async (req: Request, res: Response) => {
    await EditAccountEmailService(req, res);
    return res.status(200).send('Account Email Updated Successfully');
  }),

  // Product endpoints
  getAllProducts: asyncHandler(async (req: Request, res: Response) => {
    const products = await getAllProducts();
    return res.status(200).json(products);
  }),

  getProductById: asyncHandler(async (req: Request, res: Response) => {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product Not Found' });
    }
    return res.status(200).json(product);
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    await createProduct(req.body, req, res);
    // return res
    //   .status(201)
    //   .json({ message: 'Product created successfully', result });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    await updateProduct(req.params.id, req.body, req, res);
    // return res
    //   .status(200)
    //   .json({ message: 'Product updated successfully', updated });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    await deleteProduct(req.params.id, req, res);
    // return res.status(200).json({ message: 'Product deleted successfully' });
  }),

  // Demand Forecast endpoints
  getAllForecasts: asyncHandler(async (req: Request, res: Response) => {
    const forecasts = await getAllForecasts();
    return res.status(200).json(forecasts);
  }),

  getForecastById: asyncHandler(async (req: Request, res: Response) => {
    const forecast = await getForecastById(req.params.id);
    if (!forecast) {
      return res.status(404).json({ error: 'Forecast Not Found' });
    }
    return res.status(200).json(forecast);
  }),

  createForecast: asyncHandler(async (req: Request, res: Response) => {
    await createForecast(req.body, req, res);
    // return res
    //   .status(201)
    //   .json({ message: 'Forecast created successfully', newForecast });
  }),

  updateForecast: asyncHandler(async (req: Request, res: Response) => {
    const updatedForecast = await updateForecast(
      req.params.id,
      req.body,
      req,
      res
    );
    return res
      .status(200)
      .json({ message: 'Forecast updated successfully', updatedForecast });
  }),

  deleteForecast: asyncHandler(async (req: Request, res: Response) => {
    await deleteForecast(req.params.id, req, res);
    // return res.status(200).json({ message: 'Forecast deleted successfully' });
  }),

  // Material endpoints
  getAllMaterials: asyncHandler(async (req: Request, res: Response) => {
    const materials = await getAllMaterials();
    return res.status(200).json(materials);
  }),

  getMaterialById: asyncHandler(async (req: Request, res: Response) => {
    const material = await getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material Not Found' });
    }
    return res.status(200).json(material);
  }),

  createMaterial: asyncHandler(async (req: Request, res: Response) => {
    const newMaterial = await createMaterial(req, res, req.body);
    return res
      .status(201)
      .json({ message: 'Material created successfully', newMaterial });
  }),

  updateMaterial: asyncHandler(async (req: Request, res: Response) => {
    const updatedMaterial = await updateMaterial(
      req,
      res,
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .json({ message: 'Material updated successfully', updatedMaterial });
  }),

  deleteMaterial: asyncHandler(async (req: Request, res: Response) => {
    await deleteMaterial(req.params.id, req, res);
    return res.status(200).json({ message: 'Material deleted successfully' });
  }),

  // Work Order endpoints
  getAllWorkOrders: asyncHandler(async (req: Request, res: Response) => {
    const workOrders = await getAllWorkOrders();
    return res.status(200).json(workOrders);
  }),

  getWorkOrderById: asyncHandler(async (req: Request, res: Response) => {
    const workOrder = await getWorkOrderById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({ error: 'Work Order Not Found' });
    }
    return res.status(200).json(workOrder);
  }),

  createWorkOrder: asyncHandler(async (req: Request, res: Response) => {
    const newWorkOrder = await createWorkOrder(req.body);
    return res
      .status(201)
      .json({ message: 'Work Order created successfully', newWorkOrder });
  }),

  updateWorkOrder: asyncHandler(async (req: Request, res: Response) => {
    const updatedWorkOrder = await updateWorkOrder(req.params.id, req.body);
    return res
      .status(200)
      .json({ message: 'Work Order updated successfully', updatedWorkOrder });
  }),

  deleteWorkOrder: asyncHandler(async (req: Request, res: Response) => {
    await deleteWorkOrder(req.params.id);
    return res.status(200).json({ message: 'Work Order deleted successfully' });
  }),

  // Production Schedule endpoints
  getAllSchedules: asyncHandler(async (req: Request, res: Response) => {
    const schedules = await getAllSchedules();
    return res.status(200).json(schedules);
  }),

  getScheduleById: asyncHandler(async (req: Request, res: Response) => {
    const schedule = await getScheduleById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule Not Found' });
    }
    return res.status(200).json(schedule);
  }),

  createSchedule: asyncHandler(async (req: Request, res: Response) => {
    await createSchedule(req.body, req, res);
    // return res
    //   .status(201)
    //   .json({ message: 'Schedule created successfully', newSchedule });
  }),

  updateSchedule: asyncHandler(async (req: Request, res: Response) => {
    const updatedSchedule = await updateSchedule(
      req.params.id,
      req.body,
      req,
      res
    );
    return res
      .status(200)
      .json({ message: 'Schedule updated successfully', updatedSchedule });
  }),

  deleteSchedule: asyncHandler(async (req: Request, res: Response) => {
    await deleteSchedule(req.params.id, req, res);
    // return res.status(200).json({ message: 'Schedule deleted successfully' });
  }),

  getAccount: asyncHandler(async (req: Request, res: Response) => {
    await getAccount(req, res);
    // return res.status(200).json({ message: 'Schedule deleted successfully' });
  }),
};

export default apiController;
