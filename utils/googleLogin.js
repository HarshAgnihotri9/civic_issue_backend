const {OAuth2Client} = require("google-auth-library");
const User = require("../models/User");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = require("../utils/generateToken");

exports.googleLogin = async(req,res)=>{

try{

const {token} = req.body;

const ticket = await client.verifyIdToken({
idToken:token,
audience:process.env.GOOGLE_CLIENT_ID
});

const payload = ticket.getPayload();

const email = payload.email;
const name = payload.name;
const picture = payload.picture;
const googleId = payload.sub;

let user = await User.findOne({email});

if(!user){

user = await User.create({
name,
email,
googleId,
avatar:picture
});

}

res.json({
user,
token:generateToken(user._id)
});

}catch(error){

res.status(500).json({message:error.message});

}

};