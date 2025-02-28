import jwt, { JwtPayload } from 'jsonwebtoken';

const AccessToken = (account: JwtPayload) => {
  const payload = {
    _id: account.id,
    email: account.email,
    core: account.core,
    role: account.role,
    __v: account.__v,
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '1h',
  });
};

const authToken = () => {
  const payload = {
    service: 'Core 1',
  };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });
};

export { AccessToken, authToken };
