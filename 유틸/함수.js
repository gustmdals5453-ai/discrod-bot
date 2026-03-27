const 유저 = require("../모델/유저");

exports.유저가져오기 = async (id)=>{
  let u = await 유저.findOne({ userId:id });
  if(!u) u = await 유저.create({ userId:id });
  return u;
};

exports.숫자 = (n)=>n.toLocaleString();
