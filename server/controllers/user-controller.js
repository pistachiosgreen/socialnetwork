var db = require('../database/database');
var bcrypt = require('bcryptjs');

var salt = bcrypt.genSaltSync(5);
var jwt = require('jsonwebtoken');


module.exports.createUser = function(req,res){
	var password = bcrypt.hashSync(req.body.user_password, salt);
	var query = "INSERT INTO users (username, user_password, email) VALUES ('" +
	req.body.username + "', '" + password + "', '" + req.body.email + "')";

	db.query(query).spread(function(result,metadata){
		res.status(200).send("User was successfully created");
	}).catch(function(err){
		res.status(500).send(err);
	})
}

module.exports.logIn = function(req,res){
    var submittedPassword = req.body.password;
	var query = "select * from users where username='" + req.body.loginName +
	"' or email ='" + req.body.loginName + "'";
	db.query(query).spread(function(result,metadata){
		if (result.length > 0){
			var userData = result[0];
			var isVerified = bcrypt.compare(submittedPassword, userData.user_password);
			var token = jwt.sign(userData, process.env.SECRET,{
				expiresIn: 60*60*24
			});
			delete userData.user_password;
				if (isVerified){
					res.json({
						data: userData,
						token: token
					});
				}
				else{
					res.status(400).send("password not correct");
				}
		}
	}).catch(function(err){
		res.status(500).send("unable to process query");
	})

}