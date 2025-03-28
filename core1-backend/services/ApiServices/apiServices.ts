import { Request, Response } from '../../types/express-types';

import prisma from '../../prisma';
import axios from 'axios';
import { authToken } from '../../lib/genJwtToken';
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      product: {
        include: {
          materials: true,
        },
      },
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

interface Forecast {
  month: string;
  sales: number;
}

interface MovingAverage {
  window: number;
  months: string;
  average: number;
}

export const Analysis = async (req: Request, res: Response) => {
  try {
    const forecasts: Forecast[] = await prisma.demandForecast.findMany({
      orderBy: { month: "asc" },
    });

    const salesData = forecasts.map((f) => f.sales);
    const months = forecasts.map((f) => f.month);
    const windowSize = 3;

    const calculateMovingAverages = (data: number[], labels: string[], size: number): MovingAverage[] => {
      const averages: MovingAverage[] = [];
      for (let i = 0; i <= data.length - size; i++) {
        const windowSales = data.slice(i, i + size);
        const avg = windowSales.reduce((sum, v) => sum + v, 0) / size;
        const label = labels.slice(i, i + size).join(", ");
        averages.push({
          window: i + 1,
          months: label,
          average: parseFloat(avg.toFixed(2)),
        });
      }
      return averages;
    };

    const movingAverages = calculateMovingAverages(salesData, months, windowSize);

    const totalSales = salesData.reduce((sum, val) => sum + val, 0);
    const averageSales = salesData.length ? parseFloat((totalSales / salesData.length).toFixed(2)) : 0;

    let highestSales: Forecast = { month: "", sales: 0 };
    let lowestSales: Forecast = { month: "", sales: Number.MAX_SAFE_INTEGER };

    forecasts.forEach((forecast) => {
      if (forecast.sales > highestSales.sales) highestSales = forecast;
      if (forecast.sales < lowestSales.sales) lowestSales = forecast;
    });

    if (forecasts.length === 0) lowestSales = { month: "", sales: 0 };

    let predictedNextMonthSales: number | null = null;
    if (movingAverages.length > 0) {
      const lastMovingAverage = movingAverages[movingAverages.length - 1].average;
      predictedNextMonthSales = parseFloat(lastMovingAverage.toFixed(2));
    }

    const context = `Sales Data by Month:\n${forecasts
      .map((f) => `${f.month}: PHP ${f.sales.toLocaleString()}`)
      .join("\n")}\n\nMoving Averages (Window Size: ${windowSize}):\n${movingAverages
        .map((m) => `Window ${m.window} (${m.months}): PHP ${m.average.toLocaleString()}`)
        .join("\n")}`;

    const prompt = `
You are a sales analyst assistant. Use the context below to generate insights.

Context:
${context}

Instructions:
- Provide key trends, peaks and dips in performance.
- Offer predictions or recommendations if applicable.
- Keep the tone professional and business-focused.
- Use PHP as currency.
`;

    let geminiAnalysis = "";
    try {
      const result = await model.generateContent(prompt);
      geminiAnalysis = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (geminiError) {
      console.error("Gemini generation error:", geminiError);
      geminiAnalysis = "Failed to generate AI-powered analysis.";
    }

    return res.status(200).json({
      movingAverages,
      totalSales,
      averageSales,
      highestSales,
      lowestSales,
      predictedNextMonthSales,
      analysis: geminiAnalysis,
    });
  } catch (error) {
    console.error("Forecast analysis error:", error);
    return res.status(500).json({ message: "Failed to generate forecast analysis." });
  }
}