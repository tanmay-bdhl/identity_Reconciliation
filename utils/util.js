const Contact = require("../models/contact.js");
const _ = require('lodash')

let ctrl = {

    findPrimary : (ids) => {
        return new Promise((resolve, reject) => {
          if (!ids.length) {
            resolve(null);
            return;
          }
          
          const primaryId = _.find(ids, (id) => id.linkedPrecedend == 'primary');
          if (primaryId) {
            resolve(primaryId);
          } else {
            Contact.findById(ids[0].linkedId, (err, res) => {
              console.log('res:', res);
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          }
        });
      },
}
module.exports=ctrl;