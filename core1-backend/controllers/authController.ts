import {
  LoginService,
  LogoutService,
} from '../services/AuthServices/authService';
import { Request, Response } from '../types/express-types';

import asyncHandler from './asyncHandler';

const authController = {
  Login: asyncHandler(async (req: Request, res: Response) => {
    LoginService(req, res);
  }),

  Logout: asyncHandler(async (req: Request, res: Response) => {
    LogoutService(req, res);
  }),
};

export default authController;
