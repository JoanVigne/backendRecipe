const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Connect to SQLite database
const dbPath = path.join(__dirname, "api", "myRecipeDB.db");
const db = new sqlite3.Database(dbPath);

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Route pour obtenir des données
app.get("/api/recipes", (req, res) => {
  db.all("SELECT * FROM recipes", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ data: rows });
  });
});
// Route pour modifier (mettre à jour) une recette
app.patch("/api/recipes/:id", (req, res) => {
  console.log(`Received PATCH request for recipe with ID: ${req.params.id}`);
  const { id } = req.params;
  const { name, category, ingredients, instructions } = req.body; // Assuming these are the fields you want to update

  // SQL query to update the recipe. Use placeholders for security (to prevent SQL injection)
  const sql = `UPDATE recipes SET name = ?, category = ?, ingredients = ?, instructions = ? WHERE id = ?`;

  // Parameters to pass into the SQL query
  const params = [name, category, ingredients, instructions, id];

  // Execute the SQL query
  db.run(sql, params, function (err) {
    if (err) {
      console.error("Error executing SQL: ", err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe updated successfully", changes: this.changes });
  });
});
// Route pour supprimer des données
app.delete("/api/recipes/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM recipes WHERE id = ?", id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Recipe deleted successfully", changes: this.changes });
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
