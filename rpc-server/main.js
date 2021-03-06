var express = require('express');
const { SocketAddress } = require('net');
const cors = require('cors');
var app = express();
app.use(cors({
    origin: '*',
}))

var server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
var path = require('path');

// Liste de joueurs
// Liste de tours
// tour d'un joueur : {playerId: 1, attack: 'paper'}
// Ajout au tour
// QUAND tour.playerActions.length = players.length ==> renvoyer le tour complet
// Tour : {
//  playerActions : [
//      {playerId: 1, attack: 'paper'},
//      {playerId: 2, attack: 'scisors'},
//  ],
//  winnerId : 1
// }
var rounds = [];
var currentRound = {};
const ATTACKS = {
    scisors : 'scisors',
    rock : 'rock',
    paper : 'paper',
}

server.listen(8081,function(){ // Listens to port 8081
    console.log('Listening on '+server.address().port);

    server.lastPlayderID = 0; // Keep track of the last id assigned to a new player

    io.on('connection',function(socket){
        console.log('connect');
        socket.on('newplayer',function(){
            console.log(socket);
            socket.player = {
                id: server.lastPlayderID++,
            };
            socket.emit('allplayers',getAllPlayers());
            socket.emit('playerId', socket.player.id);
            socket.broadcast.emit('newplayer',socket.player);
            
            socket.on('play', function(socket){
                currentRound.playerActions.push({
                    playerId: socket.player.id,
                    attack: socket.attack,
                });
    
                if(currentRound.playerActions.length === 2){
                    const winnerId = getWinnerId();
                    currentRound.winnerId = winnerId;
                    socket.emit('endOfRound', currentRound);
                    newRound();
                }
                else {
                    // send current round
                }
            });
            
            socket.on('disconnect',function(){
                console.log('disconnect');
                io.emit('remove',socket.player.id);
            });
        });

    });
});

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function newRound(){
    currentRound = {
        playerActions : [],
        winnerId: null,
    };
}

function getWinnerId(){
    const actions = currentRound.playerActions;
    let winnerId = null;
    if (actions[0].attack === ATTACKS.rock){
        if(actions[1].attack === ATTACKS.paper){
            winnerId = 1;
        } 
        
        else if (actions[1].attack === ATTACKS.scisors) {
            winnerId = [0]
        }
    }
    else if (actions[0].attack === ATTACKS.paper) {
        if(actions[1].attack === ATTACKS.scisors){
            winnerId = 1;
        }

        else if(actions[1].attack === ATTACKS.rock){
            winnerId = 0;
        }
    }
    else if (actions[0].attack === ATTACKS.scisors){
        if(actions[1].attack === ATTACKS.rock){
            winnerId = 1;
        }
        
        else if (actions[1].attack === ATTACKS.paper){
            winnerId = 0;
        }
    }
    return winnerId;
}