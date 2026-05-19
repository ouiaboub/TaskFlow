const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 8080;
const SECRET_KEY = 'votre_cle_secrete_super_securisee_mockup'; // En production, utilisez une variable d'environnement

// Middlewares
app.use(cors());
app.use(express.json());

// Initialisation de la base de données SQLite
const dbPath = path.join(__dirname, 'taskflow.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Création de la table des utilisateurs
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    )`);

    // Création de la table des tâches pour le mockup "TaskFlow"
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'TODO',
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Insertion d'un utilisateur de test par défaut
    const defaultEmail = 'test@example.com';
    const defaultPassword = 'password123';
    
    db.get('SELECT id FROM users WHERE email = ?', [defaultEmail], (err, row) => {
      if (!err && !row) {
        const hash = bcrypt.hashSync(defaultPassword, 10);
        db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [defaultEmail, hash, 'Test User'], (insertErr) => {
          if (!insertErr) {
            console.log(`✅ Utilisateur de test créé : ${defaultEmail} / ${defaultPassword}`);
          }
        });
      }
    });
  });
}

// ----------------------------------------------------
// ROUTES API
// ----------------------------------------------------

// Route de Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'L\'email et le mot de passe sont requis.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Génération du JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name }, 
      SECRET_KEY, 
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

// Route d'inscription (Sign Up)
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Tous les champs sont requis (nom, email, mot de passe).' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur interne du serveur.' });
    if (row) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });

    const hash = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hash, name], function(insertErr) {
      if (insertErr) return res.status(500).json({ error: 'Erreur lors de la création du compte.' });

      // Génération du JWT après l'inscription
      const token = jwt.sign(
        { id: this.lastID, email, name }, 
        SECRET_KEY, 
        { expiresIn: '24h' }
      );
      
      res.json({ token, user: { id: this.lastID, name, email } });
    });
  });
});

// Middleware pour vérifier le JWT sur les routes protégées (comme les tâches)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Accès non autorisé.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide ou expiré.' });
    req.user = user;
    next();
  });
};

// Route pour récupérer les tâches de l'utilisateur
app.get('/api/tasks', authenticateToken, (req, res) => {
  db.all('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
    res.json(rows);
  });
});

// Route pour créer une tâche
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Le titre de la tâche est requis.' });
  }

  const taskStatus = status || 'TODO';
  db.run('INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)', 
    [title, description, taskStatus, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de la création de la tâche.' });
      
      db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la récupération.' });
        res.status(201).json(row);
      });
  });
});

// Route pour mettre à jour une tâche
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  db.run('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?', 
    [title, description, status, id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tâche non trouvée.' });
      
      res.json({ id: parseInt(id), title, description, status, user_id: req.user.id });
  });
});

// Route pour supprimer une tâche
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', 
    [id, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de la suppression.' });
      if (this.changes === 0) return res.status(404).json({ error: 'Tâche non trouvée.' });
      
      res.json({ message: 'Tâche supprimée avec succès.' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend TaskFlow démarré sur http://localhost:${PORT}`);
});
