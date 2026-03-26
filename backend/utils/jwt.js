const jwt=require("jsonwebtoken")

exports.sign=id=>{
 return jwt.sign(
  {id},
  process.env.JWT_SECRET,
  {expiresIn:"7d"}
 )
}

exports.verify=token=>{
 return jwt.verify(token,process.env.JWT_SECRET)
}