const { response } = require("../app.js");
const Contact = require("../models/contact.js");
const _ = require('lodash')

let ctrl = {

    index: function index(req,res) {
        const email = req.body?.email ;
        const phone = req.body?.phone ;
        console.log('req', req.body);
        if(!email && !phone){
            res.send({data:'nothing here'});
            return;
        }
        try {

            Contact.findContact({email,phone},(err,result)=>{
                if (err)
                  res.status(500).send({
                    message:
                      err.message || "Some error occurred while finding the Contact."
                  });
                else if(!result || !result.length){
                    const contact = new Contact({
                        email: email,
                        phone: phone,
                        linkedId:null,
                        linkPrecedend:'primary',
                        createdAt:new Date(),
                        updatedAt:new Date(),
                        // deletedAt:new Date(),
                      });
            
                    Contact.create(contact, (err, doc) => {
                        if (err)
                            res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the Tutorial."
                            });
                        else {
                            const data = {
                                "contact": {
                                    "primaryContatctId":doc.id,
                                    "emails": [doc.email],
                                    "phoneNumbers": [doc.phone],
                                    "secondaryContactIds": []
                                }
                            }
                            res.status(200).send(data);}
                    });
                }
                else {
    
                    var prim1 = _.filter(result,(doc)=> doc.linkPrecedend=='primary') || [];
    
                    var secId = _.filter(result,(doc)=> doc.linkPrecedend=='secondary') || [];
                    console.log('prim sec', prim1, secId);
                    
                    if(secId.length){
                        var prim2 = [];
                        _.forEach(secId,(doc)=>{
                            Contact.findById(doc.linkedId,(err,doc)=>{
                                if(err)throw err;
                                prim2.push(doc);
                            });
                        })
                        _.concat(prim1, prim2);
                    }
                    const primContact = _.minBy(prim1,'createdAt');
                    var newSecondary = _.find(prim1, (doc)=> doc.id != primContact.id)
                    console.log('111', primContact, newSecondary);
                    var emails = [primContact.email];
                    var phoneNumbers = [primContact.phone];
                    var secondaryContactIds = [];
                    if(newSecondary){
                        newSecondary.linkPrecedend = 'secondary';
                        newSecondary.linkedId = primContact.id;
                        newSecondary.updatedAt = new Date();
                        Contact.updateById(newSecondary.id,newSecondary, (err,res) => {
                            if(err) throw err;
                            secondaryContactIds.push(res.id);
                            emails.push(res.email);
                            phoneNumbers.push(res.phone);
                            Contact.updateChildSecIds(newSecondary, (err, res) => {
                                if(err) throw err;
                                _.concat(secondaryContactIds,_.map(res,'id'));
                                _.concat(emails,_.map(res,'email'));
                                _.concat(phoneNumbers,_.map(res,'phone'));
                            });
                            
                        });
                    }
                    else {
                        newSecondary = {
                            email: email,
                            phone: phone,
                            linkedId:primContact.id,
                            linkPrecedend:'secondary',
                            createdAt:new Date(),
                            updatedAt:new Date(),
                        }
                        Contact.create(newSecondary, (err, doc) => {
                            if (err)
                                res.status(500).send({
                                message:
                                    err.message || "Some error occurred while creating the Contact."
                                });
                            else {
                                emails.push(doc.email);
                                phoneNumbers.push(doc.phone);
                                secondaryContactIds.push(doc.id);
                            }
                        });
                    }
                    
                    const data = {
                        "contact": {
                            "primaryContatctId":primContact.id,
                            "emails": emails,
                            "phoneNumbers": phoneNumbers,
                            "secondaryContactIds": secondaryContactIds
                        }
                    }
                    // send response;
    
                    res.status(200).send({data});
                }
            })
        }
        catch(e) {
            res.status(500).send(err);
        }
    
    },
}


module.exports = ctrl