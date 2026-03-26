const db=require("../config/db")

exports.create=(name,userId)=>{
 return db.query(
  "INSERT INTO categories(name,user_id) VALUES(?,?)",
  [name,userId]
 )
}

exports.getAll=userId=>{
 return db.query(
  "SELECT * FROM categories WHERE user_id=?",
  [userId]
 )
}

exports.remove=(id,userId)=>{
 return db.query(
  "DELETE FROM categories WHERE id=? AND user_id=?",[id,userId]
 )
}