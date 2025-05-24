import express from 'express';
import { initDatabases } from './db';

const app = express();
initDatabases();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express + DB!');
});

app.listen(4000, () => {
  console.log('🚀 Server running at http://localhost:4000');
});
