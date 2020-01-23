// const { Router } = require("express");
import { Router } from 'express';

//teste
// import User from './app/models/User';
// routes.post('/', async (req, res) => { 
// const user = await User.create({ name: 'x', email: 'x@x', password: 'eee'})
// res.json({ user })
// );

//importar controller
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

import authMiddleware from './app/middlewares/auth';

//importar arquivos para configurar acesso de uploads
import multer from 'multer';
import multerConfig from './config/multer';


const routes = new Router();

//configurar multer
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.json({ message: "Hello Flávio" }));

routes.post('/users', UserController.store);
//utilizar middleware local
routes.put('/users', authMiddleware, UserController.update);

//utilizar middleware global [só funciona nas rotas apos essa declaração (delarar em cima para ser global)]
//routes.use(authMiddleware);

routes.post('/session', SessionController.store);

//utilizar middleware para as rotas abaixo dessa linha
routes.use(authMiddleware);

//exempo de rota que faz upload
routes.post('/files', upload.single('file'), FileController.store);

routes.post('/appointments', AppointmentController.store);

routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/available', AvailableController.index);

// module.exports = routes;
export default routes;
