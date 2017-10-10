$(document).ready(function() {
/****/
  switchView("gameSetup", "gameDiv");
  $("#gameSetup").animate({
    opacity: 1
  });
  var gCanvas = document.querySelector("#game");
  var ctx = gCanvas.getContext("2d");
  var pX, pY;
   //algorithm for computer move
  var combs = [[0, 1, 2],[0, 3, 6], [0, 4, 8],[1, 4, 7], [2, 4, 6], [2, 5, 8], [3, 4, 5], [6, 7, 8]];
  var img = new Image();
  img.src = "http://www.clker.com/cliparts/6/8/Z/b/2/1/tic-tac-toe-hi.png";
  //field object, this object is responsible for drawing picture on canvas,
  //for setting field value to combination....
  var obj = function(x, y, width, height, val) {
    var self = this;
    self.val = val;
    self.x = x;
    self.y = y;
    self.width = width;
    self.height = height;
    self.draw = function() {
      var pos = game.turn === "p1" ? 330 : 0;
      ctx.clearRect(self.x, self.y, self.width, self.height);
      ctx.drawImage(img, pos, 0, 260, 260, self.x + 15, self.y + 20, 60, 60);
    };
    self.clear = function() {
      ctx.clearRect(self.x, self.y, self.width, self.height);
    };
  };
  var arrOfObj = [];
  //creates nine field object at specific
  //location and moves them to arrOfObj array
  function setupObjects() {
    var step = Math.floor($("canvas").width() / 3);
    var x = 0;
    var y = 0;
    for (var i = 0; i < 9; i++) {
      arrOfObj.push(new obj(x * step, y * step, step, step, i));
      if (x === 2) {
        y++;
        x = -1;
      }
      x++;
    }
  }
  setupObjects();
  var gameConstructor = function() {
    var self = this;
    self.state = "setup";
    self.p1 = {
      comb: [],
      type: ""
    };
    self.p2 = {
      comb: [],
      type: ""
    };
    self.type = ""; //could be human or comp
    self.turn = "p1";
    self.enableHuman = false;
    self.klik = true; //used for disabling buttons during the game
    self.move = function(){
      var obj = checkCurrObj(pX, pY);
      if(checkState(self.p1.comb, self.p2.comb).finish === true){
          displayResult(checkState(self.p1.comb, self.p2.comb).result);
          return;
      }
      if(self[self.turn].type === "human"){
        if(self.enableHuman === true){
            if((self.p1.comb.indexOf(obj.val) !== -1)||(self.p2.comb.indexOf(obj.val) !== -1)){
              //check if field is already clicked, if so, return, do nothing
               return;
            }
           self.humanPlay(obj);
        } else {
            return;
        }
      } else {
          self.aiPlay(self.turn);
      }
    }
    self.humanPlay = function(obj) {
      arrOfObj[obj.i].draw();
      self[self.turn].comb.push(obj.val);
      self.turn = self.turn === "p1" ? "p2":"p1";
      self.enableHuman = false;
      self.move(); 
    };
    self.aiPlay = function(turn){
      //check if comp plays x or o... this is important because of minimax function
      var move;
      if (self.p1.type === "human") {
          move = minimax(self.p1.comb, self.p2.comb, false, 0).index;
      } else {
          move = minimax(self.p2.comb, self.p1.comb, false, 0).index;      
      }
      arrOfObj[move].draw();
      self[self.turn].comb.push(move);
      self.turn = self.turn === "p2" ? "p1":"p2";
      self.move();
    };
    self.start = function() {
      if(self.state === false){
        return;
      }
      //self.enableHuman = true;
      self.klik = false;
      self.move();
    };
    self.reset = function(){
      $.each(arrOfObj, function(i, obj) {
        obj.clear();
      });
      self.klik = true;
      self.p1.comb = [];
      self.p2.comb = [];
      pX = null;
      pY = null;
      self.turn = "p1";
      self.enableHuman = false;
      displayResult();
    };
    self.resetAll = function(){
      self.reset();
      $(".type").removeClass("active");
      $(".player").removeClass("active");
      self.type = "";
      self.state = "setup";
      self.p1.type = "";
      self.p2.type = "";
      switchView("gameSetup", "gameDiv");
    }
  };
  var game = new gameConstructor(); 
/*handle click events on canvas and buttons*/
  $("#game").click(function(e) {
    pX = e.pageX - $(this).offset().left;
    pY = e.pageY - $(this).offset().top;
    game.enableHuman = true;
    game.start();
  });
  $(".player").click(function() {
    var id = $(this).prop("id");
    if(game.type ==="human"){
        game.p1.type = "human";
        game.p2.type = "human";
    } else {
        game.p1.type = id==="x" ? "human" : "comp";
        game.p2.type = game.p1.type === "human" ? "comp": "human"; 
    }
    $(".player").removeClass("active");
    $(this).addClass("active");
    switchState();
    if(game.state === "setup"){
      switchView("gameSetup", "gameDiv");
    } else {
      switchView("gameDiv", "gameSetup");
      game.start();
    }
  });
  $(".type").click(function(){
    var id = $(this).prop("id");
    game.type = id === "comp"? "comp" : "human";
    $(".type").removeClass("active");
    $(this).addClass("active");
    switchState();
    if(game.state === "setup"){
      switchView("gameSetup", "gameDiv");
    } else {
      switchView("gameDiv", "gameSetup");
      game.start();
    }
  });
  $("#playAgain").click(function(){
    game.reset();
    game.start();
  });
  $("#resetAll").click(function(){
    game.resetAll();
  });


/* ---------------Helper functions------------- */
  //helper functions 
  function switchState(){
    if(game.type !== "" && game.p1.type !== ""){
      game.state = "game";
    } else {
      game.state = "setup";
    }
  }
  function switchView(show, hide){
    $("#"+hide).animate({opacity: 0}).css({visibility: "hidden"});
    $("#"+show).animate({opacity: 1}).css({visibility: "visible"});
  }
  //funcion that finds clicked object based on x and y values
function checkCurrObj(x, y){
    var obj1 = {
      i: null,
      val: null
    }
    var id;
    var x; 
    for(var i = 0; i<arrOfObj.length; i++){
      var obj = arrOfObj[i];
      if(x>obj.x && x<obj.x+obj.width && y>obj.y && y<=obj.y+obj.height){
          obj1.val = obj.val;
          obj1.i = i;
          break;
         }
    }
    return obj1; 
}
  //function that displays warnings about game selection and player
function displayNote(note) {
    var div = $("#note");
    if (note === "type") {
      div.text("Please select type of game you want").animate({
        opacity: 1
      });
    } else if (note === "player") {
      div.text("Please select player").animate({
        opacity: 1
      });
    } else{
      div.animate({
        opacity: 0
      },100);
    }
}

//function that display result 
function displayResult(note) {
    var div = $("#displayResult");
    var spanEl = $(".spanResult");
    if (note === "draw") {
      spanEl.text("It's draw. ");
      div.animate({
        opacity: 1
      });
    } else if (note === "p1") {
      spanEl.text("Player X win game. ");
      div.animate({
        opacity: 1
      });
    } else if (note === "p2") {
      spanEl.text("Player O win game. ");
      div.animate({
        opacity: 1
      });
    } else {
      div.animate({
        opacity: 0
      });
    }
  }

function checkState(p1, p2){
    var result = {
    finish: false,
    result: ""
    }
    if(p1.length+p2.length === 9){
        result.finish = true;
        result.result = "draw";
        } 
    combs.forEach(function(items, i) {
  
    if(p1.indexOf(items[0]) !=-1 && p1.indexOf(items[1]) !=-1 && p1.indexOf(items[2]) !=-1){
        result.finish = true;
        result.result = "p1";
    } else if(p2.indexOf(items[0]) !=-1 && p2.indexOf(items[1]) !=-1 && p2.indexOf(items[2]) !=-1){
        result.finish = true;
        result.result = "p2";      
    }
    });

    return result;
}

function getAvailableFields(p1, p2){
    var fields = [];
    for (var i = 0; i < 9; i++) {
        if(p1.indexOf(i)===-1 && p2.indexOf(i)===-1){
            fields.push(i);
        }
    }
    return fields;
  }
function getValFromState (winner, depth, pl1, pl2) {
    var obj = {
        index: null,
        val: null
    }
    if(winner === "p1"){
        obj.index = pl1.pop();
        obj.val = 10 - depth;
    } else if(winner === "p2") {
        obj.index = pl2.pop();
        obj.val = -10+depth;
    } else{
        obj.index = pl1.pop();
        obj.val = 0;
    }
    return obj;
}

function minimax (p1, p2, depth, maxPlayer){
    var finish = checkState(p1, p2);
    if(finish.finish){
        return getValFromState(finish.result, depth, p1, p2);
    }
    var fields = getAvailableFields(p1, p2);
    var bestVal = {
        val: null,
        index: null
    }
    bestVal.val = maxPlayer === true ? -1000 : 1000;
    for (var i = 0; i < fields.length; i++) {
        var pl1 = p1.slice();
        var pl2 = p2.slice();
        if(maxPlayer){
            pl1.push(fields[i]);
            val = minimax(pl1, pl2, depth+1, false);
            if(val.val > bestVal.val){
                bestVal.val = val.val;
                bestVal.index = fields[i];
            }
        } else {
            pl2.push(fields[i]);
            val = minimax(pl1, pl2, depth+1, true);
            if(val.val<bestVal.val){
                bestVal.val = val.val;
                bestVal.index = fields[i];
            }
        }
    }
    return bestVal;
}
});