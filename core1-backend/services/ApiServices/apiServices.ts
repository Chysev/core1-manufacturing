import { Request, Response } from '../../types/express-types';

import prisma from '../../prisma';
import axios from 'axios';
import { authToken } from '../../lib/genJwtToken';

export const AdminTokenService = async (req: Request, res: Response) => {
  if (req.account) {
    return res.status(200).json(req.account);
  } else {
    return res.status(404).json({ message: 'Account Not Found' });
  }
};

export const DeleteAccountService = async (req: Request, res: Response) => {
  const email = (req.account as { email: string }).email;

  const account = await prisma.account.findUnique({
    where: { email },
  });

  if (!account) {
    return res.status(404).send('Account Not Found');
  }
  if (account) {
    res.clearCookie('accessToken');
    await prisma.account.delete({
      where: { id: account.id },
    });
    await prisma.account.delete({
      where: { id: account.id },
    });
  }
};

export const EditAccountEmailService = async (req: Request, res: Response) => {
  const { newEmail } = req.body;

  const email = (req.account as { email: string }).email;

  if (!newEmail) {
    return res.status(400).send('Missing Required Fields');
  }

  await prisma.account.update({
    where: { email: email },
    data: { email: newEmail },
  });

  return res.status(200).send('Successfully changed email');
};

export const TokenService = async (req: Request, res: Response) => {
  if (req.account) {
    return res.status(200).json(req.account);
  } else {
    return res.status(404).json({ message: 'Account Not Found' });
  }
};

export const UserListService = async () => {
  const account = await prisma.account.findMany();
  return account;
};

// Modules

// Products

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      materials: true,
      workOrders: true,
    },
  });
};

export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      materials: true,
      workOrders: true,
    },
  });
};

export const createProduct = async (data, req, res) => {
  await prisma.product.create({
    data: data,
  });

  return res.status(200).json({ message: 'Product created successfully' });
};

export const updateProduct = async (id, data, req, res) => {
  await prisma.product.update({
    where: { id },
    data,
  });

  return res.status(200).json({ message: 'Product updated successfully' });
};

export const deleteProduct = async (id, req, res) => {
  await prisma.product.delete({
    where: { id },
  });

  return res.status(200).json({ message: 'Forecast deleted successfully' });
};

// Demand Forecast

export const getAllForecasts = async () => {
  return await prisma.demandForecast.findMany();
};

export const getForecastById = async (id: string) => {
  return await prisma.demandForecast.findUnique({
    where: { id },
  });
};

export const createForecast = async (data, req: Request, res: Response) => {
  await prisma.demandForecast.create({ data });

  return res.status(200).json({ message: 'Forecast created successfully' });
};

export const updateForecast = async (
  id: string,
  data: { month: string; sales: number },
  req,
  res
) => {
  await prisma.demandForecast.update({
    where: { id },
    data: {
      month: data.month,
      sales: data.sales,
    },
  });

  return res.status(200).json({ message: 'Forecast updated successfully' });
};

export const deleteForecast = async (
  id: string,
  req: Request,
  res: Response
) => {
  await prisma.demandForecast.delete({
    where: { id },
  });

  return res.status(200).json({ message: 'Forecast deleted successfully' });
};

// Materials

export const getAllMaterials = async () => {
  return await prisma.material.findMany();
};

export const getMaterialById = async (id: string) => {
  return await prisma.material.findUnique({
    where: { id },
  });
};

export const createMaterial = async (
  req: Request,
  res: Response,
  data: {
    material: string;
    quantity: number;
    unit: string;
    price: number;
    product_id: string;
  }
) => {
  await prisma.material.create({
    data: {
      material: data.material,
      quantity: data.quantity,
      unit: data.unit,
      price: data.price,
      product_id: data.product_id,
    },
  });

  return res.status(200).json({ message: 'Material created successfully' });
};

export const updateMaterial = async (
  req: Request,
  res: Response,
  id: string,
  data: { material: string; quantity: number; unit: string; price: number }
) => {
  await prisma.material.update({
    where: { id },
    data: {
      material: data.material,
      quantity: data.quantity,
      unit: data.unit,
      price: data.price,
    },
  });
  return res.status(200).json({ message: 'Material updated successfully' });
};

export const deleteMaterial = async (
  id: string,
  req: Request,
  res: Response
) => {
  await prisma.material.delete({
    where: { id },
  });

  return res.status(200).json({ message: 'Material deleted successfully' });
};

// Work Order

export const getAllWorkOrders = async () => {
  return await prisma.workOrder.findMany({
    include: {
      product: true,
      prodSched: true,
    },
  });
};

export const getWorkOrderById = async (id) => {
  return await prisma.workOrder.findUnique({
    where: { id },
    include: {
      product: true,
      prodSched: true,
    },
  });
};

export const createWorkOrder = async (data) => {
  return await prisma.workOrder.create({
    data: data,
  });
};

export const updateWorkOrder = async (id, data) => {
  return await prisma.workOrder.update({
    where: { id },
    data,
  });
};

export const deleteWorkOrder = async (id) => {
  return await prisma.workOrder.delete({
    where: { id },
  });
};

// Schedule
export const getAllSchedules = async () => {
  return await prisma.productionSchedule.findMany({
    include: {
      workOrders: true,
    },
  });
};

export const getScheduleById = async (id: string) => {
  return await prisma.productionSchedule.findUnique({
    where: { id },
    include: {
      workOrders: true,
    },
  });
};

export const createSchedule = async (data, req: Request, res: Response) => {
  await prisma.productionSchedule.create({ data });

  return res.status(200).json({ message: 'Schedule created successfully' });
};

export const updateSchedule = async (id, data, req: Request, res: Response) => {
  await prisma.productionSchedule.update({
    where: { id },
    data,
  });
  return res.status(200).json({ message: 'Schedule updated successfully' });
};

export const deleteSchedule = async (
  id: string,
  req: Request,
  res: Response
) => {
  await prisma.productionSchedule.delete({
    where: { id },
  });

  return res.status(200).json({ message: 'Schedule deleted successfully' });
};

export const getAccount = async (req: Request, res: Response) => {
  const Token = authToken();
  const response = await axios.get(
    'https://gateway.jjm-manufacturing.com/admin/get-accounts',
    {
      params: {
        service: 'Core 1',
      },
      headers: {
        Authorization: `Bearer ${Token}`,
      },
    }
  );

  res.status(200).json({ users: response.data });
};
