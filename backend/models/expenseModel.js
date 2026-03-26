const db=require("../config/db")

exports.add=(userId,categoryId,groupId,amount,note,date)=>{
 return db.query(
  "INSERT INTO expenses(user_id,category_id,group_id,amount,note,date) VALUES(?,?,?,?,?,?)",
  [userId,categoryId,groupId,amount,note,date]
 )
}

exports.getByUser=userId=>{
 return db.query(
  "SELECT e.*, c.name as category, g.name as group_name FROM expenses e " +
  "LEFT JOIN categories c ON e.category_id=c.id " +
  "LEFT JOIN \`groups\` g ON e.group_id=g.id " +
  "WHERE e.user_id=? ORDER BY e.date DESC", [userId]
 )
}

exports.delete=(id,userId)=>{
 return db.query("DELETE FROM expenses WHERE id=? AND user_id=?",[id,userId])
}
