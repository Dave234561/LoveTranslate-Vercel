import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// On enregistre les routes API
// Note: registerRoutes retourne le serveur HTTP dans le code original, 
// mais ici on a juste besoin d'attacher les routes à l'app express.
registerRoutes(app);

export default app;
