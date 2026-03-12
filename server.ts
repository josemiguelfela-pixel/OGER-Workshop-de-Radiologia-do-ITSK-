import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const db = new Database('workshop.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    institution TEXT NOT NULL,
    course TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/register', (req, res) => {
    const { name, email, whatsapp, institution, course, year } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO registrations (name, email, whatsapp, institution, course, year) VALUES (?, ?, ?, ?, ?, ?)');
      stmt.run(name, email, whatsapp, institution, course, year);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao salvar inscrição' });
    }
  });

  app.get('/api/registrations', (req, res) => {
    // Simple admin check - in a real app use proper auth
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer oger-admin-2026') {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      const rows = db.prepare('SELECT * FROM registrations ORDER BY created_at DESC').all();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
  });

  app.get('/api/stats', (req, res) => {
    try {
      const count = db.prepare('SELECT COUNT(*) as total FROM registrations').get();
      res.json(count);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
