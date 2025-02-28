import { Request, Response, NextFunction } from '../types/express-types';

import jwt from 'jsonwebtoken';

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res
      .status(401)
      .send({ message: 'Missing access token and refresh token' });
  }

  const verifyAccessToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  req.account = verifyAccessToken as User;

  if (req.account) {
    return next();
  }

  return res
    .status(403)
    .send({ message: 'You are not authorized and admin to this page' });
};

export default isAuthenticated;
