import axios from 'axios';
import bcrypt from 'bcrypt';
import { Request, Response } from '../../types/express-types';
import { AccessToken, authToken } from '../../lib/genJwtToken';

export const LoginService = async (req: Request, res: Response) => {
  const { email, password } = req.body as Login;

  try {
    const Token = authToken();
    const response = await axios.get(
      'https://gateway.jjm-manufacturing.com/admin/get-accounts',
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      }
    );

    const users = response.data;

    const account = users.find((user: any) => user.email === email);

    if (!account) {
      return res.status(401).send({ message: 'Account not found' });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      account?.password as any
    );

    if (!passwordMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const accessToken = AccessToken(account);

    res.cookie('accessToken', accessToken, { httpOnly: true });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
};

export const LogoutService = async (req: Request, res: Response) => {
  res.clearCookie('accessToken');

  return res.status(200).send('Successfully Logged Out');
};
