import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("cookies.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    contactNumber TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    recipeId TEXT NOT NULL,
    recipeName TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    totalPrice REAL NOT NULL,
    status TEXT NOT NULL,
    orderDate TEXT NOT NULL,
    deliveryDate TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/recipes", (req, res) => {
    const recipes = db.prepare("SELECT * FROM recipes ORDER BY date DESC").all();
    res.json(recipes.map((r: any) => ({
      ...JSON.parse(r.data),
      id: r.id,
      name: r.name,
      date: r.date
    })));
  });

  app.post("/api/recipes", (req, res) => {
    const recipe = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO recipes (id, name, data, date) VALUES (?, ?, ?, ?)");
    stmt.run(recipe.id, recipe.name, JSON.stringify(recipe), recipe.date);
    res.json({ success: true });
  });

  app.delete("/api/recipes/:id", (req, res) => {
    db.prepare("DELETE FROM recipes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY orderDate DESC").all();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const order = req.body;
    const stmt = db.prepare(`
      INSERT INTO orders (
        id, customerName, contactNumber, email, address, notes, 
        recipeId, recipeName, quantity, totalPrice, status, orderDate, deliveryDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id || crypto.randomUUID(),
      order.customerName,
      order.contactNumber || null,
      order.email || null,
      order.address || null,
      order.notes || null,
      order.recipeId,
      order.recipeName,
      order.quantity,
      order.totalPrice,
      order.status || 'pending',
      order.orderDate || new Date().toISOString().split('T')[0],
      order.deliveryDate || null
    );
    res.json({ success: true });
  });

  app.patch("/api/orders/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/orders/:id", (req, res) => {
    db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
