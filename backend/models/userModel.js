const db=require("../config/db")

exports.createUser=(name,email,password)=>{
 return db.query(
  "INSERT INTO users(name,email,password) VALUES(?,?,?)",
  [name,email,password]
 )
}

exports.findByEmail=email=>{
 return db.query(
  "SELECT * FROM users WHERE email=?",[email]
 )
}

exports.findById=id=>{
 return db.query(
  "SELECT id,name,email FROM users WHERE id=?",[id]
 )
}