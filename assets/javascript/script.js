/*
 * Creation & Computation - Digital Futures, OCAD University
 * Kate Hartman / Nick Puckett
 * 
 * remote controller that sends a variable to all the listening devices
 * phone only
 */

/* 

SceneNumber variable

//CHECK FOR HIGHEST NUMBER
for (var i; i < 10; i ++){

    if (i > 0) {
        i = newHighest;
    }
    
}

*/
var currentRoundNumber = 0;
var numberOfPlayers = 2;
var currentQuestionIndex = 0;
var numberOfRecievedAnswers = 0;
var thisPlayersIndex = null;

//BOOLEAN TO ENSURE ONLY ANSWER PER PLAYER
var alreadyAnswered = 0;

var allPlayers = [];
var allQuestions = [
    
    {
        question: "What is Jerry's name?",
        answerA: "Joe",
        answerB: "Jerry",
        answerC: "Will",
        answerD: "Lily",
        correctAnswer: "B"
    },
    {
        question: "What time is Noon?",
        answerA: "1:30pm",
        answerB: "4:00pm",
        answerC: "12:00pm",
        answerD: "Infinity!",
        correctAnswer: "C"
    },
    {
        question: "What class is this for?",
        answerA: "Atelier2",
        answerB: "English",
        answerC: "Gym",
        answerD: "Art",
        correctAnswer: "A"
    },
    {
        question: "Who is our proff?",
        answerA: "Gregory S.B",
        answerB: "Samuel J",
        answerC: "Alfred H.",
        answerD: "Nick P",
        correctAnswer: "D"
    }


];

var dataServer;
var pubKey = 'pub-c-d41b58e7-05c8-423d-8ff5-bd42356a9845';
var subKey = 'sub-c-8789e4ac-135a-11e9-b4a6-026d6924b094';

//input variables

//name used to sort your messages. used like a radio station. can be called anything
var channelName = "kahoot";
var setupChannelName = "kahootSetup"

//GRAPHIC ELEMENTS
var answerABtn, answerBBtn, answerCBtn , answerDBtn;
var questionLabel;
var nameInput;

function setup() 
{

  
  background(255);
  
   // initialize pubnub
    dataServer = new PubNub(
    {
        publish_key   : pubKey,  //get these from the pubnub account online
        subscribe_key : subKey,  
        ssl: true  //enables a secure connection. This option has to be used if using the OCAD webspace
      
    });
    
    //attach callbacks to the pubnub object to handle messages and connections
    dataServer.addListener({ message: readIncoming });
    dataServer.subscribe({channels: [channelName]});
    //WE ALSO WANT TO SUBSCRIBE TO THE SETUP CHANNEL, USED FOR ADDING PLAYERS TO LOBBY
    dataServer.subscribe({channels: [setupChannelName]});

    
    background(255);
    noStroke();
    
    nameInput = createInput();
    var btn = createButton("Join");
    btn.mousePressed(requestJoinGame);
    
    setupAnswerButtons();
    
}

function setupAnswerButtons(){
    
    //ON EVERY ROUND EXCEPT FOR THE FIRST ONE, REMOVE THE BUTTONS
    if (currentRoundNumber > 0) {
        questionLabel.remove();
        answerABtn.remove();
        answerBBtn.remove();
        answerCBtn.remove();
        answerDBtn.remove();
    }
    
    //THEN CREATE THEM AGAIN WITH NEW QUESTION INFORMATION
    questionLabel = createP(allQuestions[currentQuestionIndex].question);
    
    //CREATE THE FOUR BUTTONS
    answerABtn = createButton('A ' + allQuestions[currentQuestionIndex].answerA);
    answerABtn.style('width', "300px");
    answerABtn.style('height', "300px");
    answerBBtn = createButton('B ' + allQuestions[currentQuestionIndex].answerB);
    answerBBtn.style('width', "300px");
    answerBBtn.style('height', "300px");
    answerCBtn = createButton('C ' + allQuestions[currentQuestionIndex].answerC);
    answerCBtn.style('width', "300px");
    answerCBtn.style('height', "300px");
    answerDBtn = createButton('D ' + allQuestions[currentQuestionIndex].answerD);
    answerDBtn.style('width', "300px");
    answerDBtn.style('height', "300px");
    
    answerABtn.mousePressed(chooseOptionA);
    answerBBtn.mousePressed(chooseOptionB);
    answerCBtn.mousePressed(chooseOptionC);
    answerDBtn.mousePressed(chooseOptionD);
}


function readIncoming(inMessage){
    
    
    
    if (inMessage.channel == channelName){
        
        //ONLY EXCEPT ANSWERS FROM REGISTARED PLAYERS
        if (inMessage.message.playerIndex != null){
            
            //ADD TO THE NUMBER OF ANSWERS
            numberOfRecievedAnswers++;


            //CHECK IF THE THE RECIEVED ANSWER IS THE RIGHT ONE
            if(inMessage.message.answerLetter == allQuestions[currentQuestionIndex].correctAnswer) {

                //DISPLAY CORRECT ON NEXT SCREEN

                //IF IT IS THEN ADD ONE TO THAT PLAYERS SCORE
                allPlayers[inMessage.message.playerIndex].score += 1;

                console.log(allPlayers[inMessage.message.playerIndex].name + " guessed correctly!");

            } else {

                console.log(allPlayers[inMessage.message.playerIndex].name + " guessed wrong!");
            }


            //ONCE EVERYONE HAS ANSWERED
            if (numberOfRecievedAnswers == numberOfPlayers) {

                //LOAD NEW PAGE
                //SCENE VARIABLE SWITCH
                newRound();

            } 
        }else {
            
                alert("You have not joined a game yet!");
            
        }
    //IF A MESSAGE IS RECIEVED FROM THE SETUP CHANNEL
    //RECIEVED ANYTIME SOMEONE WANTS TO JOIN A GAME
    } else if (inMessage.channel == setupChannelName) {
        
        //FIRST WE HAVE TO MAKE SURE THEY HAVE NOT ALREADY JOINED
        var alreadyAdded = false;
        
        //CYCLE THOUGH ALL THE PLAYERS AND MAKE SURE NO ONE HAS THAT NAME
        for (var i = 0; i < allPlayers.length; i ++){

            if (allPlayers[i].name == inMessage.message.playerName){
                alreadyAdded = true;
            }
            
        }
        
        //IF NO PLAYER WITH THAT NAME EXSISTS ADD THEM TO THE ALLPLAYERS ARRAY
        if (!alreadyAdded) {
            
            //ADD PLAYER TO ARRAY
            allPlayers.push({
                playerIndex: allPlayers.length,
                name: inMessage.message.playerName,
                score:0
            });
            
            
            
            //IF IT WAS THIS MACHINE THAT SENT THE REQUEST TO JOIN GAME
            if (inMessage.message.playerName == nameInput.value()){
                
                //CYCLE THROUGH ALL THE PLAYERS
                for (var i = 0; i < allPlayers.length; i ++){
                    
                    //FIND THIS PLAYER IN THE ARRAY OF ALL PLAYERS, BECAUSE YOU MAY NOT BE THE FIRST TO JOIN
                    if (allPlayers[i].name == inMessage.message.playerName){
                        //SET THIS PLAYERS INDEX TO BE THE RIGHT NUMBER
                        thisPlayersIndex = allPlayers[i].playerIndex;
                    }
                    
                    //IF THIS PLAYER WAS THE LAST ONE TO JOIN, THEN WE ARE READY TO PLAY
                    if (allPlayers.length == numberOfPlayers){
                        
                        alert("Everyone is ready, lets play!");
                    }
            
                }
                
            }
            
        } else {
            
            alert("A player with this name already exsists!");
        }
        
    
    }
}

//CALLED BY
function requestJoinGame (){
    
    //WHEN THE PLAYER PRESSES THE JOIN BUTTON, SEND A REQUEST ON THE SETUP CHANNEL, PASSING THROUGH THE VALUE IN THE TEXT BOX
    dataServer.publish({
    
            channel: setupChannelName,
            message:
            {
                playerName: nameInput.value()
            }
    
    });
   
}

//CALLED BY ___ ONCE A NEW QUESTION IS POSED
function newRound(){
    
    console.log("New Round");
    
    //Reset the number of answers
    numberOfRecievedAnswers = 0;
    
    //ALLOW THE PLAYER TO BE ABLE TO ANSWER AGAIN
    alreadyAnswered = false;
    
    //INCREASE THE ROUND NUMBER
    currentRoundNumber++;
    //PICK A RANDOM QUESTION INDEX
    //currentQuestionIndex = int(random(0,allQuestions.length));
    if (currentQuestionIndex == allQuestions.length-1){
        
        currentQuestionIndex = 0;
        
    } else {
       
        currentQuestionIndex++;
    }
    //REFRESH THE ANSWER BUTTONS TO DISPLAY THE NEW INFORMATION
    setupAnswerButtons();
}

//CALLED WHEN THIS PLAYER SELECTS AN ANSWER
function chooseOptionA() {
    
    if (!alreadyAnswered) {
        
        dataServer.publish({
    
            channel: channelName,
            message:
            {
                playerIndex: thisPlayersIndex,
                answerLetter: "A"
            }
    
        });
        
        alreadyAnswered = true;
    }

}
function chooseOptionB() {
    
    if (!alreadyAnswered) {
        
        dataServer.publish({
    
            channel: channelName,
            message:
            {
                playerIndex: thisPlayersIndex,
                answerLetter: "B"
            }
    
        });
        
        alreadyAnswered = true;
    }

}
function chooseOptionC() {
    
    if (!alreadyAnswered) {
        
        dataServer.publish({
    
            channel: channelName,
            message:
            {
                playerIndex: thisPlayersIndex,
                answerLetter: "C"
            }
    
        });
        
        alreadyAnswered = true;
    }

}
function chooseOptionD() {
    
    if (!alreadyAnswered) {
        
        dataServer.publish({
    
            channel: channelName,
            message:
            {
                playerIndex: thisPlayersIndex,
                answerLetter: "D"
            }
    
        });
        
        alreadyAnswered = true;
    }

}
