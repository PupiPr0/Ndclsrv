/**
 * Created by abderrahimelimame on 4/7/17.
 */

module.exports = function(io, users, debugging_mode, pingInterval) {

  io.on('connection', function(socket) {


    /*****************************************************************************************************************************************
     ********************************************* Users Connection Methods  *****************************************************************
     *****************************************************************************************************************************************/

    /**
     * Ping/Pong methods
     * */

    socket.on('socket_pong', function(data) {


      if (debugging_mode) {
        //    console.log("Pong received from client ");
      }
    });

    setTimeout(sendHeartbeat, pingInterval);

    function sendHeartbeat() {

      setTimeout(sendHeartbeat, pingInterval);
      io.sockets.emit('socket_ping', {
        beat: 1
      });
    }


    /**
     * method to save user as connected
     */
    socket.on('socket_user_connect', function(data) {
      if (debugging_mode) {
        console.log("the user with id " + data.connectedId + " connected " + +data.connected + " token " + data.userToken + "socket.id " + socket.id);
      }
      if (data.connectedId != null && data.connectedId != 0) {
        var user = users.getUser(data.connectedId);
        if (user != null) {
          users.updateUser(data.connectedId, data.connected, socket.id);
        } else {
          users.addUser(data.connectedId, data.connected, socket.id);
        }

        io.sockets.emit('socket_user_connect', {
          connectedId: data.connectedId,
          connected: true,
          socketId: data.socketId
        });

      }


    });


    /**
     * method if a user is disconnect from sockets
     * and then remove him from array of current users connected
     */
    socket.on('disconnect', function() {
      var usersArray = users.getUsers();
      if (usersArray.length != 0) {
        for (var i = 0; i < usersArray.length; i++) {
          var user = usersArray[i];
          if (user != null) {

            if (user.socketID == socket.id) {
              if (debugging_mode) {
                console.log("the user with id  " + user.ID + " is disconnect 1 ");
              }
              io.sockets.emit('socket_user_connect', {
                connectedId: user.ID,
                connected: false,
                socketId: user.socketID
              });

              users.removeUser(user.ID);
              if (debugging_mode) {
                console.log("the users list size disconnect " + usersArray.length);
              }
              break;
            }

          } else {
            if (debugging_mode) {
              console.log("the user is null disconnect ");
            }
          }


        }
      }
    });

    socket.on('socket_user_disconnect', function(data) {

      if (data.connectedId != null && data.connectedId != 0) {
        if (debugging_mode) {
          console.log("the user with id  " + data.connectedId + " is disconnect  2");
        }

        var user = users.getUserBySocketID(data.socketId);
        if (user != null) {

          io.sockets.emit('socket_user_connect', {
            connectedId: user.ID,
            connected: false,
            socketId: user.socketID
          });

          users.removeUser(user.ID);

        }
      }
    });


    /**
     * method to check if recipient is Online
     */
    socket.on('socket_is_online', function(data) {
      io.sockets.emit('socket_is_online', {
          senderId: data.senderId,
       //    senderId: "55536890679",
        connected: data.connected
      });
    });
    /**
     * method to check status last seen
     */
    /*      socket.on('socket_last_seen', function (data) {
              io.sockets.emit('socket_last_seen', {
                  lastSeen: data.lastSeen,
                  senderId: data.senderId,
                  recipientId: data.recipientId
              });
          });*/


    /*****************************************************************************************************************************************
     ********************************************* Single User Messages Methods  *****************************************************************
     *****************************************************************************************************************************************/



    socket.on('socket_update_register_id', function(data) {
      var user = users.getUser(data.recipientId);
      if (user != null) {
        socket.to(user.socketID).emit('socket_update_register_id', data);
      }
    });


    /*****************************************************************************************************************************************
     ********************************************* Users Call Methods  *****************************************************************
     *****************************************************************************************************************************************/

    /**
     * method to check if user is connected  before call him (do a ping and get a callback)
     */
    socket.on('socket_call_user_ping', function(data, callback) {
      if (debugging_mode)
        console.log("socket_call_user_ping called ");

      var user = users.getUser(data.recipientId);
      var pingedData;
      if (user != null) {
        console.log("socket id " + user.socketID);
        pingedData = {
          socketId: user.socketID,
          recipientId: data.recipientId,
          connected: true
        };
        callback(pingedData);
      } else {
        pingedData = {
          socketId: null,
          recipientId: data.recipientId,
          connected: false
        };
        callback(pingedData);
      }

    });

    /**
     * method to check if user is already on users array
     */
    socket.on('reset_socket_id', function(data, callback) {
      if (debugging_mode)
        console.log("reset_socket_id called " + data.userSocketId);
      var pingedData = {
        userSocketId: data.userSocketId
      };
      callback(pingedData);
    });

    /**
     * method make the connection between the too peer
     */
    socket.on('signaling_server', function(data) {
      if (debugging_mode)
        console.log("signaling_server called " + data.to);
      var socketId = data.to;
      /*var user = users.getUserBySocketID(data.to);
       if (user != null) {*/
      delete data.to;
      socket.to(socketId).emit('signaling_server', data);
      /*} else {
       console.log("user is null  signaling_server function ");
       //kolo adasnt skergh bach ighiga null nrj3 request bach ndir dialog this person is not available like whatsapp
       }*/

    });

    var makeCall = function(data) {
      if (debugging_mode)
        console.log("make_new_call function " + data.to);
      /* var user = users.getUserBySocketID(data.to);
       if (user != null) {*/
      socket.to(data.to).emit('receive_new_call', data);
      /*} else {
       console.log("user is null  make_new_call function ");
       //kolo adasnt skergh bach ighiga null nrj3 request bach ndir dialog this person is not available like whatsapp
       }*/

    };
    /**
     * method to initialize the new call
     */
    socket.on('make_new_call', makeCall);

    /**
     * method to Reject a call
     */
    socket.on('reject_new_call', function(data) {
      if (debugging_mode)
        console.log("reject_new_call function ");
      /* var user = users.getUserBySocketID(data.callerSocketId);
       if (user != null) {*/
      socket.to(data.callerSocketId).emit("reject_new_call", data);
      /*} else {
       console.log("user is null reject_new_call function ");
       }*/
    });


    /**
     * method to Accept a call
     */
    socket.on('accept_new_call', function(data) {
      if (debugging_mode)
        console.log("accept_new_call function ");
      /*var user = users.getUserBySocketID(data.callerSocketId);
       if (user != null) {
       */
      socket.to(data.callerSocketId).emit("accept_new_call", data);
      /*} else {
       console.log("user is null  accept_new_call function ");
       }*/
    });
    /**
     * method to HangUp a call
     */
    socket.on('hang_up_call', function(data) {
      if (debugging_mode)
        console.log("hang_up_call function ");
      /*      var user = users.getUserBySocketID(data.callerSocketId);
       if (user != null) {*/
      socket.to(data.callerSocketId).emit("hang_up_call", data);
      /*} else {
       console.log("user is null  hang_up_call function ");
       }*/
    });


  });
};
