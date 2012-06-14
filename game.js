$(function(){
	soundManager.debugMode = false;
	
	var uid, accessToken;
	// score
	var fbEnabled = false;
	var score = 0;
	var topScore  = 0;
	var topScoreHolder = "";
	var playerLife = 3;
	
	var updateScore = function() {
		var scoreDiv = $("#score");
		$("#score div").remove();
		var scoreToDisplay = score;
		for(var i=6 ; i >= 0; i--){
			var display = Math.floor(scoreToDisplay / Math.pow(10, i));
			scoreDiv.addSprite("num_"+i,{animation: font[display], posx: (5-i)*14, height: 14, width: 12});
			scoreToDisplay -= display * Math.pow(10, i);
		}
	};
	var updateTopScore = function() {
		var scoreDiv = $("#topscore");
		$("#topscore div").remove();
		var scoreToDisplay = topScore;
		for(var i=6 ; i >= 0; i--){
			var display = Math.floor(scoreToDisplay / Math.pow(10, i));
			scoreDiv.addSprite("num_t_"+i,{animation: font[display], posx: (5-i)*14, height: 14, width: 12});
			scoreToDisplay -= display * Math.pow(10, i);
		}
		$("#topScore").html("Top Score amongst your friends<br/><strong>"+topScoreHolder+": "+topScore+"pt</strong>");
	};
	
	var leaderBoard = function () {
		if(fbEnabled){
			FB.api('/XXXXXXXXXXXXXXX/scores', function(response) {
	     		$("#gameover").html("Your score: "+score+"pt<br/><br/><strong>Top Scores amongst your friends</strong><br/>");
	     		for(var i = 0; i < response.data.length; i++) {
	     			$("#gameover").append(response.data[i].user.name+": "+response.data[i].score+"pt</br>")
	     		}
	     		$("#gameover").append("<a href='.'>Retry</a>");
		     });
		} else {
			$("#gameover").html("Your score: "+score+"pt<br/><a href='.'>Retry</a>");
		}
	}
	
	var saveScore = function() {
		if(fbEnabled){
			FB.api('/'+uid+'/scores', function(response) {
			  	if((response.data.length === 0) || (score > response.data[0].score)) {
			  		$.ajax({
				     type: 'POST',
				     async: false,
				     url: 'savescore.php' + '?score=' + score,
				     success: function(response) {
				     	leaderBoard();
				     }
				   });
			  	} else {
			  		leaderBoard();
			  	}
		    });
	   } else {
	   		leaderBoard();
	   }
	}
	
	var over = false;
	var gameOver = function() {
		over = true;
		
		laser3.stop();
		enemy_dies.stop();
		bibischSound.stop();
		
		$("#gameover").show().fadeTo(0, 0.9);
		// publish high score to FB
		saveScore();
	}
	
	
	// define sounds
	var laser3 = new $.gameQuery.SoundWrapper("laser3.mp3", false);
	var enemy_dies = new $.gameQuery.SoundWrapper("die.mp3", false);
	var bibischSound = new $.gameQuery.SoundWrapper("bibisch.mp3", true);
	
	//define animations
	var font = [];
	font[0] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:   0});
	font[1] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  12});
	font[2] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  24});
	font[3] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  36});
	font[4] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  48});
	font[5] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  60});
	font[6] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  72});
	font[7] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  84});
	font[8] = new $.gameQuery.Animation({imageURL: "font.png", offsetx:  96});
	font[9] = new $.gameQuery.Animation({imageURL: "font.png", offsetx: 108});

	var playerLaser = [];
	playerLaser[0] = new $.gameQuery.Animation({imageURL: "shoot_player.png", offsety:   0});
	playerLaser[1] = new $.gameQuery.Animation({imageURL: "shoot_player.png", offsety:   14});
	playerLaser[2] = new $.gameQuery.Animation({imageURL: "shoot_player.png", offsety:   28});
	playerLaser[3] = new $.gameQuery.Animation({imageURL: "shoot_player.png", offsety:   42});
	playerLaser[4] = new $.gameQuery.Animation({imageURL: "shoot_player.png", offsety:   56});
	
	var unilLaser = new $.gameQuery.Animation({imageURL: "shoot_unil.png",
											numberOfFrame: 3,
											delta: 12,
											rate: 300,
											type: $.gameQuery.ANIMATION_HORIZONTAL});
	
	var background = new $.gameQuery.Animation({imageURL: "back.png"});
	var player = new $.gameQuery.Animation({imageURL: "player.png"});
	var shoot = new $.gameQuery.Animation({imageURL: "shoot.png"});
	var enemy1 = new $.gameQuery.Animation({imageURL: "enemies.png", 
											numberOfFrame: 2,
											delta: 24,
											rate: 600,
											type: $.gameQuery.ANIMATION_VERTICAL});
	var enemy2 = new $.gameQuery.Animation({imageURL: "enemies.png", 
											numberOfFrame: 2,
											offsetx: 27,
											delta: 24,
											rate: 600,
											type: $.gameQuery.ANIMATION_VERTICAL});
	var enemy3 = new $.gameQuery.Animation({imageURL: "enemies.png", 
											numberOfFrame: 2,
											offsetx: 63,
											delta: 24,
											rate: 600,
											type: $.gameQuery.ANIMATION_VERTICAL});
	var explosion = new $.gameQuery.Animation({imageURL: "enemies.png", 
											numberOfFrame: 3,
											offsetx: 102,
											delta: 24,
											rate: 300,
											type: $.gameQuery.ANIMATION_VERTICAL | $.gameQuery.ANIMATION_ONCE | $.gameQuery.ANIMATION_CALLBACK});
	
	var bibisch = new $.gameQuery.Animation({imageURL: "bibisch.png"});
	var life = new $.gameQuery.Animation({imageURL: "life.png"});
											
	// sets the div to use to display the game and its dimension
	$("#playground").playground({width: 512, height: 512, keyTracker: true})
		.addSprite("background", {posx: 0, posy: 0, animation: background, width: 512, height: 512})
		.addSprite("player", {posx: 241, posy: 476, animation: player, width: 30, height: 19})
		.addGroup("enemies", {posy: 80}).end()
		.addGroup("score", {posx: 24, posy: 40, height: 14, width: 100}).end()
		.addGroup("topscore", {posx: 230, posy: 40, height: 14, width: 100}).end()
		.addSprite("life1", {posx: 480, posy: 40, animation: life, width: 19, height: 10})
		.addSprite("life2", {posx: 455, posy: 40, animation: life, width: 19, height: 10})
		.addSprite("life3", {posx: 430, posy: 40, animation: life, width: 19, height: 10})
	
	// generate enemies
	var dir = 1;
	var generateEnemies = function() {
		dir = 1;
		for(var i=0; i < 10; i++){
			$("#enemies")
				.addSprite("enemy1a_"+i, {posx: i * 40 + 5, posy: 0, animation: enemy1, width: 23, height: 23})
				.addSprite("enemy1b_"+i, {posx: i * 40 + 5, posy: 40, animation: enemy1, width: 23, height: 23})
				.addSprite("enemy2a_"+i, {posx: i * 40 + 2, posy: 80, animation: enemy2, width: 32, height: 23})
				.addSprite("enemy2b_"+i, {posx: i * 40 + 2, posy: 120, animation: enemy2, width: 32, height: 23})
				.addSprite("enemy3a_"+i, {posx: i * 40, posy: 160, animation: enemy3, width: 35, height: 23})
				.addSprite("enemy3b_"+i, {posx: i * 40, posy: 200, animation: enemy3, width: 35, height: 23});
			$("#enemy1a_"+i).data("offset",7).addClass("enemy");
			$("#enemy1b_"+i).data("offset",7).addClass("enemy");
			$("#enemy2a_"+i).data("offset",4).addClass("enemy");
			$("#enemy2b_"+i).data("offset",4).addClass("enemy");
			$("#enemy3a_"+i).data("offset",2).addClass("enemy");
			$("#enemy3b_"+i).data("offset",2).addClass("enemy");
		}
	}
	generateEnemies();
	
	// configure the loading bar
	$.loadCallback(function(percent){
		$("#loadBar").width(400*percent);
	});
	
	// register the start button and remove the splash screen once the game is ready to starts
	$("#start").click(function(){
		$.playground().startGame(function(){
			updateScore();
			updateTopScore();
			$("#splash").remove();
			
			// configure the mute button
			$.playground().append("<div id='mutebutton' class='muteButton' style='position: absolute; top: 0px; z-index:1000'></div>");
			$("#mutebutton").click(function(){
                $this = $(this);
                $this.toggleClass("muteButton");
                $this.toggleClass("unmuteButton");
                if($this.data("muted")){
                    $.muteSound(false);
                    $this.data("muted", false);
                } else {
                    $.muteSound(true);
                    $this.data("muted", true);
                }
                return false;
            });
		});
		return false;
	});
	
	// control
	var missilCounter = 0;
	var bibischUsed = false;
	$.playground().registerCallback(function(){
		if(!over){
			if($.gameQuery.keyTracker[65]){ //this is left! (a)
				if($("#player").x() > 10){
					$("#player").x(-10, true);
				}
			}
			if($.gameQuery.keyTracker[68]){ //this is right! (d)
				if($("#player").x() < 480){
					$("#player").x(10, true);
				}
			}
		}
	}, 90);
	
	var canShoot = true;
	var bibischActive = false;
	$.playground().registerCallback(function(){
		canShoot = true;
	}, 300);
	$(document).keydown(function(){
		if(!over){
			if($.gameQuery.keyTracker[77] && canShoot){ //this is shoot! (m)
				//Shoot
				laser3.play();
				canShoot = false;
				missilCounter = (missilCounter + 1) % 10000;
				$.playground().addSprite("missil_"+missilCounter, {animation: playerLaser[Math.floor(Math.random()*5)], posx: $("#player").x() + 10, posy: 461, width: 10, height: 14});
				$("#missil_"+missilCounter).addClass("missil");
			}
			if($.gameQuery.keyTracker[66] && !bibischUsed){
				bibischSound.play();
				bibischUsed = true;
				bibischActive = true;
				$("#background").addSprite("bibisch",{animation: bibisch, width: 141, height: 180, posx: -141, posy:200});
			}
		}
	});
	
	
	// game Logic
	var deleteEnemy = function () {
		if(!$(this).data("dead")){
			enemy_dies.play();
			$(this).x(-$(this).data("offset"), true);
			$(this).w(38);
			$(this).setAnimation(explosion, function(node){
				$(node).remove();
			});
			score += 10;
			updateScore();
		}
		$(this).data("dead", true);
	}
	$.playground().registerCallback(function(){
		if(!over){
			// move missil up
			$(".missil").each(function(){
				$(this).y(-10,true);
				if($(this).y() < 0) {
					$(this).remove();
				}
				// test collison
				var collide = $(this).collision("#enemies, .enemy");
				if(collide.size() > 0){
					$(this).remove();
					collide.each(deleteEnemy);
				}
			});
			$(".missil_unil").each(function() {
				$(this).y(5,true);
				if($(this).y() > 475) {
					$(this).remove();
				}
			})
			$("#player").collision(".missil_unil").each(function() {
				$(this).remove();
				$("#life"+playerLife).remove();
				playerLife--;
				if(playerLife < 0){
					// gameOver
					gameOver();
					return false;
				}
			})
			if(bibischActive){
				$("#bibisch").x(10, true);
				if($("#bibisch").x() > 512){
					$("#bibisch").remove();
					bibischActive = false;
					bibischSound.stop();
				}
				var collide = $("#bibisch").collision("#enemies, .enemy");
				if(collide.size() > 0){
					$(this).remove();
					collide.each(deleteEnemy);
				}
			}
		}
		
	}, 90)
	
	var speed = 1200;
	$.playground().registerCallback(function(){
		if(!over){
			// move invader arround
			$("#enemies").x(10*dir, true);
			if($("#enemies").x() > 110){
				$("#enemies").x(110);
				dir = -1;
				$("#enemies").y(40, true);
			}
			if($("#enemies").x() < 0){
				$("#enemies").x(0);
				dir = 1;
				$("#enemies").y(40, true);
			}
			var bottom = 0;
			$(".enemy").each(function(){
				var toto = $(this).y() + $("#enemies").y();
				
				if($(this).y() + $("#enemies").y() > bottom) {
					bottom = $(this).y() + $("#enemies").y();
				}
			});
			if(bottom > 400){
				// gameOver
				gameOver();
				return false;
			} else {
				if(Math.random() > 0.5) {
					missilCounter++;
					$.playground().addSprite("missil_unil_"+missilCounter, {animation: unilLaser, posx: Math.floor(Math.random()*400), posy: bottom, width: 12, height: 20});
					$("#missil_unil_"+missilCounter).addClass("missil_unil");
				}
			}
			if($(".enemy").size() == 0){
				$("#enemies").xy(0, 80);
				generateEnemies();
				score += 50;
				speed *= 0.9;
				return speed;
			}
		}
	}, speed);
	
	
	// Facebook integration:
	// get Score:
	var getFbScore = function () {
		if(fbEnabled){
			FB.api('/XXXXXXXXXXXXXXX/scores', function(response) {
			  	topScore = response.data[0].score;
			  	topScoreHolder = response.data[0].user.name;
			  	updateTopScore();
		     });
	    }
	};
	   
	// init	
    FB.init({
      appId      : 'XXXXXXXXXXXXXXX', // App ID
      channelUrl : '//CHANEL_URL', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true,  // parse XFBML
    });
	
	// login button:
	FB.getLoginStatus(function(response) {
		if (response.authResponse) {
            //user is already logged in and connected
            uid = response.authResponse.userID;
		    accessToken = response.authResponse.accessToken;
		    fbEnabled = true;
		    getFbScore();
        } else {
        	$("#fb-start").show();
        }
	});
	
	$("#fb-start").click(function(){
		FB.login(function(response) {
		   if (response.authResponse) {
		     $("#fb-start").hide();
		     uid = response.authResponse.userID;
	         accessToken = response.authResponse.accessToken;
	    	 fbEnabled = true;
		     getFbScore();
		   }
		},{scope: "publish_actions"});
		
		return false;
	});
});