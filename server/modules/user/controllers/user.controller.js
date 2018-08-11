const _ = require('lodash');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var { Login } = require('./user.schemas');
var { mongoose } = require('./../../../db/mongoose');
var {tokencheck} = require('./../../../middleware/tokencheck');
const { SignUpModel } = require('./user.models');

let validateEmail = (req, res) => {
    var body = _.pick(req.body,['email']);
    SignUpModel.findOne({ email: body.email}).then((user) => {
        if(!user){
            return res.json({ code: 400, message: false});
        }        
        return new Promise((resolve, reject) =>{
                if(resolve){
                    return res.json({ code: 200, message: true});
                }
            });
        });
}
module.exports.validateEmail = validateEmail;

let signUp = (req,res) => {
    var body = _.pick(req.body,['fullname','email','password']);
    var gen_token = jwt.sign({email: body.email },'abc123',{expiresIn:  1 * 60 }).toString();
    body.token = gen_token;
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(body.password,salt,(err,hash) => {
            body.password = hash;
            var signUpModel = new SignUpModel(body);
            signUpModel.save().then((user) => {
                if(user)
                return res.json({ code: 200, message: true});           
            }).catch((e) => {
                console.log(e);
                return res.json({ code: 400, message: e});        
            })
        })
    })
}
module.exports.signUp = signUp;

let signIn = (req,res) => {
    var body = _.pick(req.body,['email','password']);
    SignUpModel.findOne({email: body.email}).then((result) => {
        if(!result){
            return res.json({ code: 200, message: 'Email id not registered!!'});
        }
        return bcrypt.compare(body.password,result.password,(err,result) => {
            if(result){
                var newToken = jwt.sign({email: body.email },'abc123',{expiresIn:  1 * 60 }).toString();
                SignUpModel.updateOne({email: body.email},{$set: {token: newToken}}, (err) =>{
                    if(err){
                        return res.json({ code: 200, message: 'Unable to generate and update Token'});
                    }
                    return res.json({ code: 200, message: "User signin successful", token: newToken });
                });
            }else{
                return res.json({ code: 200, message: "Password Wrong!!"});
            }
        });
    });
}
module.exports.signIn = signIn;

let details = (req,res) => {    
    SignUpModel.findOne({email: req.param('email')}).then((user) => {
    if(!user){
        return  res.status(400).send("User details not found!!");
    }        
    return res.send(user.password);
    });
}

module.exports.details = details;