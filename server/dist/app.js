import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middlewares/error-handler.js';
import cors from 'cors';
import { usersRouter } from './routes/users.routes.js';
import { ApplicationsRouter } from './routes/applications.routes.js';
import { filesRouter } from './routes/files.routes.js';
import { requirementsRouter } from './routes/requeriments.routes.js';
import { pdfsRoutes } from './routes/pdfs.router.js';
import { historyRouter } from './routes/history.routes.js';
import { AuditRouter } from './routes/audit.routes.js';
import { estratoRouter } from './routes/estrato.routes.js';
import { rolesRouter } from './routes/roles.routes.js';
// Routers
const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check
app.get('/api/health', (_, res) => res.json({ ok: true }));
// Rutas de las diferentes tablas
app.use('/api/users', usersRouter);
app.use('/api/applications', ApplicationsRouter);
app.use('/api/files', filesRouter);
app.use('/api/requirements', requirementsRouter);
app.use('/api/pdfs', pdfsRoutes);
app.use('/api/history', historyRouter);
app.use('/api/audit', AuditRouter);
app.use('/api/estrato', estratoRouter);
app.use('/api/roles', rolesRouter);
// Middleware de errores
app.use(errorHandler);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ API escuchando en http://localhost:${port}`);
});
