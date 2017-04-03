var express = require('express');
var router = express.Router();
var db = require('../database/database');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.use(function(req,res,next){
	var token = req.headers['auth-token'];
	jwt.verify(token, process.env.SECRET, function(err, decoded){
		if (err){
			res.status(400).send("token is invalid");
		}
		else{
			console.log(decoded.id);
			req.user_id = decoded.id;
			next();
		}
	});
});
//get endpoints

router.get('/get_friends', function(req, res){
	//var query = "select * from user_friends where user_id=" + req.query.user_id;
	var query = "select friend.friend_id, friend.date_friended, u.username, u.display_name from user_friends friend inner join users u on (u.id = friend.friend_id) where user_id=" + req.user_id;
	db.query(query).spread(function(result, metadata){
		res.json({
			data: result
		});
	}).catch(function(err){
		res.status(500).send(err);
	});
});

router.get('/get_friend_requests', function(req,res){
	//var query = "select * from user_friend_requests where received_id=" + req.query.user_id + " and status='pending'";
    var query = "select request.id, request.sender_id, request.received_id, u.username from user_friend_requests request inner join users u on (u.id = request.sender_id) where request.received_id=" + req.user_id + " and status = 'pending'";
	db.query(query).spread(function(result, metadata){
		res.json({
			data: result
		});
	}).catch(function(err){
		res.status(500).send(err);
	});
});

router.get('/get_users_by_quantity', function(req,res){
	var query = "SELECT users.id, users.username FROM users " + 
	"WHERE NOT EXISTS (SELECT users.id FROM user_friends WHERE " +
	"(users.id = user_friends.friend_id and user_friends.user_id =" + req.user_id +")) and"
	+ " users.id !=" + req.user_id;
	db.query(query).spread(function(result, metadata){
		res.json({
			data: result
		});
	}).catch(function(err){
		res.status(500).send("unable to query db at this time");
	});


});
//post endpoints
router.post('/request_friend', function(req,res){
	//res.status(200).send("going to request a friend");
	//check to see if a request has been sent or already are friends
	//var query = "select * from user_friend_requests where sender_id= " + req.body.sender_id + " and received_id=" + req.body.received_id;
	var query = "select * from user_friend_requests where sender_id= " + req.user_id + " and received_id=" + req.body.received_id;
	db.query(query).spread(function(result,metadata){
		if (result.length === 0){
			insertRequest();
		}
	}).catch(function(err){
		res.status(500).send(err);
	});


	function insertRequest(){
		//var query = "insert into user_friend_requests (sender_id, received_id, status) Values (" + req.body.sender_id + "," + req.body.received_id + ", 'pending')";
		var query = "insert into user_friend_requests (sender_id, received_id, status) Values (" + req.user_id + "," + req.body.received_id + ", 'pending')";
		db.query(query).spread(function(result,metadata){
			res.status(200).send("friend request created successfully");
		}).catch(function(err){
			res.status(500).send(err);
		})
	}
});

router.post('/request_friend_respond', function(req,res){
	//check to see if the request even exists
	var query = "select * from user_friend_requests where id=" + req.body.request_id;
	var senderId;
	var receivedId;
	db.query(query).spread(function(result, metadata){
		if (result.length > 0){
			//update accordingly
			senderId = result[0].sender_id;
			receivedId = result[0].received_id;
			updateRequest();
		}
		else{
			res.status(400).send("request doesn't exist");
		}
	});

	function updateRequest(){
		var isAccepted = req.body.confirmation === 'confirmed';
		var query;
		if (isAccepted){
    	query = "update user_friend_requests set status='" + req.body.confirmation + "' where id=" + req.body.request_id;
		}
		else{
		
		query= "delete from user_friend_requests where id=" + req.body.request_id;
		}
	
		db.query(query).spread(function(){
			if (isAccepted){
				performSenderInsert();
			}
			else{
			res.status(200).send("we have successfully deleted request");
			}
		}).catch(function(){
			res.status(400).send("unable to process update to user friend request");
		})
	}
	
    function performSenderInsert(){
    	var query = "insert into user_friends (user_id, friend_id, date_friended) values (" + senderId + ", " + receivedId + ", now())";

    	db.query(query).spread(function(){
    		performReceiverInsert();
    	}).catch(function(){
    		res.status(500).send("unable to send a friend request");
    	})
    }

    function performReceiverInsert(){
    	var query = "insert into user_friends (user_id, friend_id, date_friended) values (" + receivedId + ", " + senderId + ", now())";

    	db.query(query).spread(function(){
    		res.status(200).send("user was confirmed");
    	}).catch(function(){
    		res.status(500).send("unable to send a friend request");
    	})
    }


});

module.exports = router;


