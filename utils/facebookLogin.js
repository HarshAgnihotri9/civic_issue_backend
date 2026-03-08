const User = require("../models/User");

exports.facebookLogin = async(req,res)=>{

try{

const {accessToken} = req.body;

const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;

const response = await axios.get(url);

const {id,name,email,picture} = response.data;

let user = await User.findOne({email});

if(!user){

user = await User.create({
name,
email,
facebookId:id,
avatar:picture.data.url
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