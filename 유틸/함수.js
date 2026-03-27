const User = require("../모델/유저");

exports.getUser = async(id)=>{
  let u = await User.findOne({userId:id});
  if(!u) u = await User.create({userId:id});
  return u;
};

exports.f = (n)=>n.toLocaleString();
exports.rand = (a)=>a[Math.floor(Math.random()*a.length)];
