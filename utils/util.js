const Contact = require("../models/contact.js");
const _ = require('lodash')

let ctrl = {

    findPrimary: function(ids){
        if(!ids.length)return null;
        var primaryId = _.find(ids,(id)=>id.linkedPrecedend='primary');
        if(!primaryId){
            Contact.findById(ids[0].linkedId,(err,res)=>{
                if(err)throw err;
                primaryId=res;
            })
        }
        return primaryId;
    },
}
module.exports=ctrl;