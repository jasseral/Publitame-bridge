module.exports = function responseModel(status,data,message){
    
    //dataAppend = []
    var responseModel = {
        status : status,
        data : data, 
        message : message,
    }
    
    return responseModel
}

 
