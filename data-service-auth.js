
var db ='mongodb+srv://sam:sam@atlascluster.kjnrv9u.mongodb.net/?retryWrites=true&w=majority';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');
var userSchema = new Schema({
    "userName":{
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [ { dateTime: Date, userAgent: String} ] 
  });


  let User; // to be defined on new connection (see below)

  module.exports.initialize = function(){
    return new Promise((resolve, reject)=> {
        User= mongoose.createConnection(db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error){
            if(error){console.log(error);
                reject();
        }
            else {
                console.log("connection successful");
             User = User.model("users", userSchema); 
            resolve();           
        }
        });

    });
    
}


module.exports.registerUser = function(userData){
    return new Promise((resolve, reject)=> {
    if(userData.password === "" || userData.password2 === ""){
        reject("Error: user name cannot be empty or only white spaces! ");

    }else if(userData.password != userData.password2){
        console.log("Hello "+userData.password, userData.password2);
        reject("Error: Passwords do not match");
    }

    bcrypt.genSalt(10, function(err, salt) { // Generate a "salt" using 10 rounds
        bcrypt.hash(userData.password, salt, function(err, hashValue) { // encrypt the password: "myPassword123"
           if(err){
            reject("There was an error encrypting the password");   
           }else{
            userData.password = hashValue;

            let newUser = new  User(userData);
   
    newUser.save((err) => {
        if(err && err.code == 11000) {
          reject("User Name already taken");
        } else if(err && err.code != 11000) {
          reject("There was an error creating the user: "+err);
        }
        else{
            console.log("Working"); //delete
            resolve();
        }
      
      });
            
           }
        });
        });


    });
}


module.exports.checkUser = function(userData){
    return new Promise((resolve, reject)=> {
        User.findOne({ userName: userData.userName})
        .exec()
        .then((data) => {
         if (!data){
            console.log("Unable to find user: "+userData.userName);
            reject();
         } else{
            bcrypt.compare(userData.password, data.password).then((res) => {
        
                console.log("Hello "+userData.user);
                if (res === true) {
                    console.log("It matches!");
                    data.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                    console.log("User found");
                    User.updateOne(
                        { userName: data.userName},
                        { $set: { loginHistory:  data.loginHistory} }
                      ).exec().then((userData) => {
                        console.log("Success");
                        resolve(data);
                      })
                      .catch((err) => {
                        console.log(err);
                        reject("Unable to find user: "+userData.user);
                      });
                  }
                  else if(res === false){
                    reject("Unable to find user: "+userData.userName);
                  }
                });

    
         }

        })
        

    });
}