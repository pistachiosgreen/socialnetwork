(function(window, angular, undefined){
	angular.module('app').controller('mainCtrl', ['$scope', '$state', '$http', 'userSvc', function($scope, $state, $http, userSvc){
		$scope.userData = userSvc.user;
		//console.log(userSvc.token);
		$scope.userFriends = [];
		$scope.users = [];
		$scope.newPost = undefined;
		$scope.friendPosts = [];
		//console.log(userSvc.token);
		var config = {
			headers: {
				'auth-token': userSvc.token
			}
		}
		//global functions
		$scope.addUser = function(userId){
			var data = {
				'received_id': userId
			}
			$http.post('/secure-api/user/request_friend', data, config).then(function(response){
				console.log("friend request was sent")
			}, function(err){
				console.log(err);
			})
		}

		$scope.respondToRequest = function(requestId, confirmation){
			var requestData = {
				'request_id' : requestId,
				'confirmation': confirmation
			}

			$http.post('/secure-api/user/request_friend_respond', requestData, config).then(function(response){
				//console.log("user added to friends")
			},function(err){
				console.log(err);
			})
		}

		$scope.submitPost = function(content){
			requestData = {
				content: content
			}

			$http.post('/secure-api/post/create_post', requestData, config).then(function(response){
				$scope.newPost = "";
				console.log('post was submitted');
			}, function(err){
				console.log(err);
			})
		}
		
		//gets friend requests
		$http.get('/secure-api/user/get_friend_requests', config).then(function(response){
			console.log("get friend requests");
			console.log(response);
			$scope.friendRequests = response.data.data;

		}, function(err){
			console.log(err);
		})

		
		//get friends
		$http({
			method: "GET",
			url: '/secure-api/user/get_friends',
			headers: {
				'auth-token': userSvc.token
			}
		}).then(function(response){
			$scope.userFriends = response.data.data;
			console.log("getting friends");
			console.log(response);
		}, function(err){
			console.err(err);
		})

		$http.get('/secure-api/post/get_friend_posts', config).then(function(response){
			$scope.friendPosts = response.data.data;

		}, function(err){
			console.log(err);
		})


		//gets list of all users
		$http({
			method: "GET",
			url: '/secure-api/user/get_users_by_quantity',
			headers: {
				'auth-token': userSvc.token
			}
		}).then(function(response){
			$scope.users = response.data.data;
			console.log("all users");
			console.log(response);
		}, function(err){
			console.err(err);
		})

	}]);
})(window, window.angular)