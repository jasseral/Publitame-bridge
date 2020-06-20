const hideEmail = (email)=> {
    return email.replace(/(.{2})(.*)(?=@)/,
    function(gp1, gp2, gp3) { 
      for(let i = 0; i < gp3.length; i++) { 
        gp2+= "*"; 
      } return gp2; 
    });
}


const hidePhone = (phone)=> {
    var phone = phone.slice(-2);
    return phone
     
}


exports.hideEmail = hideEmail;
exports.hidePhone = hidePhone;
