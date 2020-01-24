import jwt from 'jsonwebtoken';

//tranformar uma funçao que usa callback em async
import { promisify } from 'util';

import authConfig from '../../config/auth';


export default async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  //se o token nao existir, gera erro
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  //dividir strig e pegar so o valor do token (Bearer não vem)
  const [, token] = authHeader.split(' ');
  
  try {
    //jwt.verify(token, authConfig.secret, callback)
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    console.log(decoded);

    req.userId = decoded.id;

    return next();

  } catch (err) {
    
    return res.status(401).json({ error: 'Token invalid'});

  }
};