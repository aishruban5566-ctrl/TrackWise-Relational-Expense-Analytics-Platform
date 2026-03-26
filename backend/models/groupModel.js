const db=require("../config/db")

exports.create=(name,userId)=>{
 return db.query(
  "INSERT INTO groups(name,created_by) VALUES(?,?)",
  [name,userId]
 )
}

exports.getByUser=userId=>{
 return db.query(
  "SELECT * FROM groups WHERE created_by=?",
  [userId]
 )
}

exports.addMember=(groupId,userId)=>{
 return db.query(
  "INSERT INTO group_members(group_id,user_id) VALUES(?,?)",
  [groupId,userId]
 )
}

exports.removeMember=(groupId,userId)=>{
 return db.query(
  "DELETE FROM group_members WHERE group_id=? AND user_id=?",
  [groupId,userId]
 )
}

exports.delete=id=>{
 return db.query("DELETE FROM groups WHERE id=?",[id])
}
