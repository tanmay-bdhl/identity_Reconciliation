const { response } = require("../app.js");
const Contact = require("../models/contact.js");
const _ = require('lodash')
const utils = require('../utils/util')

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
                        linkedPrecedend:'primary',
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
                                    "primaryContactId":doc.id,
                                    "emails": [doc.email],
                                    "phoneNumbers": [doc.phone],
                                    "secondaryContactIds": []
                                }
                            }
                            res.status(200).send(data);}
                    });
                }
                else {
                    var emailMatch =  _.filter(result,(doc)=> email && doc.email==email) || [];
                    var phoneMatch =  _.filter(result,(doc)=> phone && doc.phone==phone) || [];

                    var prim1 = utils.findPrimary(emailMatch);
                    var prim2 = utils.findPrimary(phoneMatch);
                    var emails = _.map(result,'email') || [];
                    var phoneNumbers = _.map(result,'phone') || [];
                    var primaryContactId;
                    var secondaryContactIds = _.map(result,(doc)=>{
                        if(doc.linkedPrecedend=='secondary')return doc.id;
                    }) || [];

                    if(prim1==prim2  && prim1){
                        primaryContactId = prim1.id;
                        emails.push(prim1.email);
                        phoneNumbers.push(prim1.phone);

                    }
                    else if(prim1 != prim2 && prim1 && prim2){
                        let primaryId = _.minBy([prim1,prim2],'createdAt');
                        primaryContactId=primaryId.id;
                        if(prim1==primaryId){
                            Contact.updateSecToPrimById(prim2.id,prim1.id,(err,result)=>{
                                if(err)throw err;
                                emails = _.concat(email,_.map(result,'email'));
                                phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))

                            });
                            // update secondarycontactids,emails,phone
                        }
                        else {
                            Contact.updateSecToPrimById(prim1.id,prim2.id,(err,result)=>{
                                if(err)throw err;
                                emails = _.concat(email,_.map(result,'email'));
                                phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))
                            });
                            // update secondarycontactids,emails,phone
                        }
                    }
                    else {
                        
                        if(!prim2){
                            if(!phone){
                                Contact.getByParent(prim1.id,(err,result)=>{
                                    if(err)throw err;
                                    primaryContactId = prim1.id;
                                    emails = _.concat(email,_.map(result,'email'));
                                    phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                    secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))
                                });

                            }
                            else {
                                const contact = new Contact({
                                    email: email,
                                    phone: phone,
                                    linkedId:prim1.id,
                                    linkedPrecedend:'secondary',
                                    createdAt:new Date(),
                                    updatedAt:new Date(),
                                    // deletedAt:new Date(),
                                  });
                                  Contact.create(contact, (err, doc) => {
                                    if (err){
                                        console.log('err',err);
                                    }
                                });
                                Contact.getByParent(prim1.id,(err,result)=>{
                                    if(err)throw err;
                                    primaryContactId = prim1.id;
                                    emails = _.concat(email,_.map(result,'email'));
                                    phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                    secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))
                                });

                            }
                        }
                        else if(!prim1){
                            if(!email){
                                Contact.getByParent(prim2.id,(err,result)=>{
                                    if(err)throw err;
                                    primaryContactId = prim2.id;
                                    emails = _.concat(email,_.map(result,'email'));
                                    phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                    secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))
                                });
                            }
                            else {
                                const contact = new Contact({
                                    email: email,
                                    phone: phone,
                                    linkedId:prim2.id,
                                    linkedPrecedend:'secondary',
                                    createdAt:new Date(),
                                    updatedAt:new Date(),
                                    // deletedAt:new Date(),
                                  });
                                  Contact.create(contact, (err, doc) => {
                                    if (err){
                                        console.log('err',err);
                                    }
                                });
                                Contact.getByParent(prim2.id,(err,result)=>{
                                    if(err)throw err;
                                    primaryContactId = prim2.id;
                                    emails = _.concat(email,_.map(result,'email'));
                                    phoneNumbers = _.concat(phoneNumbers,_.map(result,'phone'))
                                    secondaryContactIds = _.concat(secondaryContactIds,_.map(result,'id'))
                                });
                            }
                        }

                    }
                    const data = {
                            "contact": {
                                "primaryContactId":primaryContactId,
                                "emails": _.uniq(emails),
                                "phoneNumbers": _.uniq(phoneNumbers),
                                "secondaryContactIds": _.uniq(secondaryContactIds)
                            }
                        }
                    res.status(200).send(data);
                }
            })
        }
        catch(e) {
            res.status(500).send(err);
        }
    
    },
}


module.exports = ctrl