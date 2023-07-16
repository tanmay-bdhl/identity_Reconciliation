const sql = require("./db.js");

// constructor
const Contact = function(Contact) {
  this.email = Contact.email;
  this.phone = Contact.phone;
  this.linkedId = Contact.linkedId;
  this.linkPrecedend = Contact.linkPrecedend
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

Contact.getAll = (title, result) => {
  let query = "SELECT * FROM Contacts";

  if (title) {
    query += ` WHERE title LIKE '%${title}%'`;
  }

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Contacts: ", res);
    result(null, res);
  });
};

Contact.getAllPublished = result => {
  sql.query("SELECT * FROM Contacts WHERE published=true", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("Contacts: ", res);
    result(null, res);
  });
};

Contact.updateById = (id, Contact, result) => {
  sql.query(
    "UPDATE Contacts SET linkPrecedend = ?, linkedId = ?, updatedAt = ? WHERE id = ?",
    [Contact.linkPrecedend, Contact.linkedId, Contact.updatedAt, id],
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

Contact.updateChildSecIds = (Contact, result) => {
  sql.query(
    "UPDATE Contacts SET linkedId = ?, updatedAt = ? WHERE linkedId = ?",
    [Contact.linkedId, Contact.updatedAt, Contact.id],
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

Contact.remove = (id, result) => {
  sql.query("DELETE FROM Contacts WHERE id = ?", id, (err, res) => {
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

    console.log("deleted Contact with id: ", id);
    result(null, res);
  });
};

Contact.removeAll = result => {
  sql.query("DELETE FROM Contacts", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} Contacts`);
    result(null, res);
  });
};

module.exports = Contact;




// 'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class Contact extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   }
//   Contact.init({
//     id: DataTypes.INTEGER,
//     phone: DataTypes.STRING,
//     email: DataTypes.STRING,
//     linkedId: DataTypes.INTEGER,
//     linkPrecedend: DataTypes.STRING,
//     createdAt: DataTypes.DATE,
//     updatedAt: DataTypes.DATE,
//     deletedAt: DataTypes.DATE
//   }, {
//     sequelize,
//     modelName: 'Contact',
//   });
//   return Contact;
// };