const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.join(__dirname, 'leads.db'), (err) => {
  if (err) {
    console.error('Database error:', err.message);
    return;
  }
});

db.serialize(() => {
  // Add more sample leads for different segments and cities
  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Ana Costa', 'ana@design.com', '(11) 95555-4444', 'ana_design', 'https://ana.design', 'Campinas', 'SP', 'Jardim', 'design', 1],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Roberto Moveis', 'roberto@moveis.com', '(11) 94444-3333', '', 'https://moveisr.com', 'Sao Paulo', 'SP', 'Pinheiros', 'moveis', 1],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Lucia Alimentos', 'lucia@food.com', '(11) 93333-2222', 'lucia_comidas', '', 'Sao Paulo', 'SP', 'Liberdade', 'alimentos', 0],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Carlos Autopecas', 'carlos@pecas.com', '(11) 92222-1111', '', '', 'Suzano', 'SP', 'Industrial', 'autopecas', 0],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Mariana Beleza', 'mariana@spa.com', '(11) 91111-0000', 'marianaspa', 'https://marianaspa.com', 'Suzano', 'SP', 'Centro', 'beleza', 1],
    (err) => {
      if (err) console.error(err.message);
      console.log('Additional sample data inserted. Total leads: 8');
      db.close();
    }
  );
});