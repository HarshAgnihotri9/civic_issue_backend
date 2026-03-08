const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
{
name:{
type:String
},

email:{
type:String,
unique:true
},

password:{
type:String
},

googleId:{
type:String
},

facebookId:{
type:String
},

avatar:{
type:String
},

role:{
type:String,
enum:["citizen","admin"],
default:"citizen"
}

},
{timestamps:true}
);

userSchema.pre("save", async function(next){

if(!this.isModified("password")) return next();

const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password,salt);

});

userSchema.methods.matchPassword = async function(enteredPassword){
return await bcrypt.compare(enteredPassword,this.password);
};

module.exports = mongoose.model("User",userSchema);