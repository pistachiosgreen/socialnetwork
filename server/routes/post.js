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

//GET
router.get('/get_friend_posts', function(req, res){
	query = "select u.username, u.display_name, post.post_content, post.id, post.date_posted from users u inner join user_friends friend on (u.id = friend.friend_id) inner join user_posts post on (post.user_id = friend.friend_id) where friend.user_id=" + req.user_id;
	db.query(query).spread(function(result, metadata){
		res.json({
			data: result
		})
	}).catch(function(err){
		res.status(500).send("unable to grab friend posts");
	})
})

//POST
router.post('/create_post', function(req, res){
	var query = "INSERT INTO user_posts (user_id, post_content, date_posted) values (" + req.user_id + " , '" + req.body.content + "', now())";
	db.query(query).spread(function(response){
		res.status(200).send("user status was updated");
	}).catch(function(err){
		res.status(500).send(err);
	})
});

module.exports = router;