exports.required=(fields,body)=>{
 for(let f of fields){
  if(!body[f]||body[f].toString().trim()==="")
   return f+" is required"
 }
 return null
}

exports.email=email=>{
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

exports.number=value=>{
 return !isNaN(value)
}

exports.password=p=>{
 return p.length>=6
}