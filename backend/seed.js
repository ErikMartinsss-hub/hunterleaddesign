const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, 'leads.db'), (err) => {
  if (err) {
    console.error('Database error:', err.message);
    return;
  }
});

db.serialize(() => {
  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['João da Silva', 'joao@cabelos.com', '(11) 98888-7777', 'joao_cabeleireiro', '', 'Suzano', 'SP', 'Centro', 'cabeleireiros', 1],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Maria Santos', 'maria@beauty.com', '(11) 97777-6666', 'maria_beauty', 'https://mariasbeauty.com', 'Suzano', 'SP', 'Vila Nova', 'beauty', 1],
    (err) => {
      if (err) console.error(err.message);
    }
  );

  db.run(
    "INSERT INTO leads (nome, email, telefone, instagram, site, cidade, estado, bairro, segmento, has_website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Pedro Oliveira', 'pedro@cabele.com', '(11) 96666-5555', '', '', 'Suzano', 'SP', 'Bela Vista', 'cabeleireiros', 0],
    (err) => {
      if (err) console.error(err.message);
      console.log('Sample data inserted');
      db.close();
    }
  );
});