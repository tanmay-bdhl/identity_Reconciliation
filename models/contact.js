const sql = require("./db.js");

// constructor
const Contact = function(Contact) {
  this.email = Contact.email;
  this.phone = Contact.phone;
  this.linkedId = Contact.linkedId;
  this.linkedPrecedend = Contact.linkedPrecedend
  this.createdAt = Contact.createdAt,
  this.updatedAt = Contact.updatedAt,
  this.deletedAt = Contact.deletedAt
};

Contact.create = (newContact, result) => {
  sql.query("INSERT INTO Contacts SET ?", newContact, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created Contact: ", { id: res.insertId, ...newContact });
    result(null, { id: res.insertId, ...newContact });
  });
};

Contact.findById = (id, result) => {
  sql.query(`SELECT * FROM Contacts WHERE id = ${id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found Contact: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found Contact with the id
    result({ kind: "not_found" }, null);
  });
};

Contact.findContact = ({email,phone}, result) => {
  sql.query(`SELECT * FROM Contacts WHERE email = '${email}' OR phone = '${phone}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found Contact: ", res);
      result(null, res);
      return;
    }

    // not found Contact with the id
    result(null, []);
  });
};

Contact.updateById = (id, Contact, result) => {
  sql.query(
    "UPDATE Contacts SET linkedPrecedend = ?, linkedId = ?, updatedAt = ? WHERE id = ?",
    [Contact.linkedPrecedend, Contact.linkedId, Contact.updatedAt, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Contact with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated Contact: ", { id: id, ...Contact });
      result(null, { id: id, ...Contact });
    }
  );
};

Contact.updateSecToPrimById = (id,primId, result) => {
  sql.query(
    "UPDATE Contacts SET linkedPrecedend = ?, linkedId = ?, updatedAt = ? WHERE id = ? OR linkedId = ?",
    ['secondary', primId, new Date(), id, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Contact with the id
        result(null, []);
        return;
      }

      console.log("updated Contact: ", { id: id, ...Contact });
      result(null, res);
    }
  );
};

Contact.getByParent = (id, result) => {
  sql.query(
    "Select * FROM Contacts WHERE linkedId = ?",
    [id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Contact with the id
        result(null, []);
        return;
      }

      console.log("updated Contact: ", { id: id, ...Contact });
      result(null, res);
    }
  );
};

module.exports = Contact;