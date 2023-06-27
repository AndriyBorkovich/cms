// run the server
const socket = io();
let user; // current user
let anotherUsers =[]; // all users from ALL chats except current one
let usersInChat = []; // all users from current chat except current one
let currentGroup; // current chat
let groups = []; // all chats

// page elements
let form = document.getElementById('chat-form');
let roomName = document.querySelector('#room-name');
let usersList = document.querySelector('#users');
let roomsList = document.querySelector('#rooms');
let chatMessages =  document.querySelector('.chat-messages');
let addUsersWindow = document.getElementById("ModalAddUsers");
let addChatWindow = document.getElementById("ModalAddChat");
let openAddUsersWindow = document.getElementById("OpenAddUsersWindow");
let openAddChatWindow = document.getElementById("OpenAddChatWindow");

// Add event listener to each <li> element
roomsList.addEventListener('click', function(event) {
  // Check if the clicked element is an <li>
  if (event.target.nodeName === 'LI') {
    // Remove the bold style from any previously selected list item
    const previouslySelected = roomsList.querySelector('.selected');
    if (previouslySelected) {
      previouslySelected.classList.remove('selected');
    }

    // Add the bold style to the clicked list item
    event.target.classList.add('selected');
    const roomName = event.target.textContent;
    console.log(roomName);
    changeChat(roomName);
  }
});

let isDropdownMenuVisible = false;

function toggleDropdownMenu() {
  const dropdownMenu = document.querySelector('.menu-content');
  if (isDropdownMenuVisible) {
    dropdownMenu.classList.remove('show');
  } else {
    dropdownMenu.classList.add('show');
  }
  isDropdownMenuVisible = !isDropdownMenuVisible;
}

let isNotificationMenuVisible = false;

function toggleNotificationMenu()
{
  const notifications = document.querySelector('.notification-header');
  const notificationPoint = document.querySelector('.not-dot');
  notificationPoint.style.animation = 'none';
  if (isNotificationMenuVisible) {
    notifications.classList.remove('show');
  } else {
    notifications.classList.add('show');
  }

  isNotificationMenuVisible = !isNotificationMenuVisible;
}

// sending message
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const messageText = e.target.elements.msg.value;
    //console.log(currentGroup._id);
    const newMessage = {
      groupName: currentGroup.chatName,
      sender: user.username,
      message: messageText,
      sendAt: new Date().toISOString().slice(0, 19).replace('T', ' ').slice(11, 16)
    };

    console.log("Current user sent:", newMessage);

    if (messageText) {
      
      //sending message to server to send it to others in that chat
      socket.emit('chatMessage', newMessage);
      showMessage(newMessage);
      e.target.elements.msg.value = '';
    }
  });

  // receive messages from other users in current chat)
  socket.on('message', (message) => {
    
    // received new message
    console.log("New message", message);

    if(message.groupName === currentGroup.chatName)
    {
      console.log("Showing message", message);
      showMessage(message);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
      console.log("Bell ringing...");
      // display messages from other user groups
      const notificationPoint = document.querySelector('.not-dot');

      // Set the CSS animation property
      notificationPoint.style.animation = 'glowing 1200ms infinite';
      const notifications = document.querySelector('.notification-header');
      notifications.insertAdjacentHTML("beforeend", 
      `<div class="not-message">
      <p class="meta">
        <span class="sender">${message.sender}</span>
        <hr>
        <span class="send-time">${message.sendAt}</span>
      </p>
      <p class="not-text">
        ${message.message}
      </p>
    </div>`)
     }
  });

  // init chat with all required data
  fetch('/getAllData')
    .then(response => response.json())
    .then(data => {

      // get current user which entered chat
      user = JSON.parse(sessionStorage.getItem('currentUser'));
      console.log("Current user:", user);
      document.querySelector(".user-name-box").textContent = user.username;

      // finding all chats from db where current user is member
      const userChats = data.filter(chat => {
        return chat.members.some(member => member.username === user.username);
      });

      console.log("All chats with current user", userChats);

      currentGroup = userChats[0];

      // display chats' names
      let chatNames = [];
      for(let i = 0; i < userChats.length; i++)
      {
        groups.push(userChats[i]._id);
        
        //adding user to all his chats
        socket.emit('joinGroup', userChats[i].chatName);
        console.log("User: " + user.username +" connected to "+ userChats[i].chatName);
        
        // adding room names
        chatNames.push(userChats[i].chatName);
      }

      // output all available chats for current user
      outputRooms(chatNames);

      // adding members from current chat
      userChats[0].members.forEach(member => {
        usersInChat.push(member);
      });
      outputUsers(usersInChat);
    
      // get chat history
      outputMessages(userChats[0].messages);
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
          icon: 'error',
          title: 'Ooops...',
          text: error.response.data,
      })
  });

  openAddUsersWindow.addEventListener('click', loadAnotherMembers);
  openAddChatWindow.addEventListener('click', loadUsers);

  // for adding new members to chat
  function loadAnotherMembers() {
    addUsersWindow.style.display = 'block';
    fetch('/loadAnotherUsers')
    .then(response => response.json())
      .then(data => {

          let selectUsers = document.getElementById("select-users");
          selectUsers.innerHTML = "";

          // find all users from other chats
          anotherUsers = data.filter(filterUser => 
            filterUser.username !== user.username &&
            !usersInChat.some(user => user.username === filterUser.username));
          
          // display them
          anotherUsers.forEach(user => {
            const option = document.createElement("option");
            option.text = `${user.username}`;
            selectUsers.appendChild(option);
          });
      })
      .catch(error => {
          console.error(error);
          Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.response.data,
          })
      });
  }

  // adding new users to chat
  function addNewMembers() {

    // get selected users from window
    let usersToInvite = document.getElementById("select-users");
    let selectedUsers = Array.from(usersToInvite.selectedOptions).map(option => option.text);
    //console.log(selectedUsers);
    let matchingUsers = anotherUsers.filter(user => selectedUsers.includes(user.username));
    //console.log(matchingUsers);
    const data = {
      chatName : currentGroup.chatName,
      members : matchingUsers,
    };

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    fetch('/addNewUsers', requestConfig)
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        location.reload();
      })
      .catch(error => {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message,
          })
      });

      addUsersWindow.style.display = 'none';
  }

  // load users for creating chat
  function loadUsers() {
    addChatWindow.style.display = 'block';
    fetch('/loadAnotherUsers')
    .then(response => response.json())
    .then(data => {

          let selectUsers = document.getElementById("select-users-for-chat");
          selectUsers.innerHTML = "";

         // find all users from other chats
          anotherUsers = data.filter(filterUser => filterUser.username !== user.username);
          // display them
          anotherUsers.forEach(user => {
            const option = document.createElement("option");
            option.text = `${user.username}`;
            selectUsers.appendChild(option);
          });
      })
      .catch(error => {
          console.error(error);
          Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.message,
          })
      });
  }

  // creating new chat room
  function createNewChat(){
    let newChatName = document.getElementById("new-chat-name").value;

    if (newChatName.trim() === '' || !/^[a-zA-Z\s]{3,}$/.test(newChatName)) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: "Incorrect chat name! Try again!",
      });

      return;
    }

    // get selected users from window
    let usersToInvite = document.getElementById("select-users-for-chat");
    let selectedUsers = Array.from(usersToInvite.selectedOptions).map(option => option.text);
    let matchingUsers = anotherUsers.filter(user => selectedUsers.includes(user.username));
    
    // don't forget to add current user
    matchingUsers.push(user);
    
    const chatData = {
      chatName : newChatName,
      members : matchingUsers,
      messages : [],
    };

    const requestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatData),
    };

    fetch('/createChat', requestConfig)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          location.reload();
      })
      .catch(error => {
          console.error(error);
          Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: error.message,
          })
      });

      addChatWindow.style.display = 'none';
  }
  
  document.getElementById('btn-add-users').addEventListener('click', addNewMembers);
  document.getElementById('btn-create-chat').addEventListener('click', createNewChat);
  document.getElementById("Close1").addEventListener('click', () => {
    addChatWindow.style.display = 'none';
  });
  document.getElementById("Close2").addEventListener('click', () => {
    addUsersWindow.style.display = 'none';
  });

  // exit chat
  function leaveChat() {
    if(currentGroup === null || typeof currentGroup === 'undefined')
    {
      Swal.fire({
        icon: 'warning',
        title: "Warning",
        text: "Create chat at first"
      });
    } else {
      const leavingUser = {
        username : user.username,
        chatName : currentGroup.chatName,
      };
      
      const requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
  
        body: JSON.stringify(leavingUser),
      };
  
      fetch('/leaveChat', requestConfig)
      .then(response => response.json())
        .then(data => {
          console.log("User left");
          console.log(data);
          location.reload();
          Swal.fire({
            icon: 'success',
            title: data.message,
          });
        })
        .catch(error => {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message,
          })
        });
    }
  }

  document.getElementById("LeaveChatButton").addEventListener('click', leaveChat);

  // remove current chat forever 
  function deleteChat() {
    if(currentGroup === null || typeof currentGroup === 'undefined')
    {
      Swal.fire({
        icon: 'warning',
        title: "Warning",
        text: "Create chat at first"
      });
    } else {
      const requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
  
        body: JSON.stringify({chatName: currentGroup.chatName}),
      };
  
      fetch('/deleteChat', requestConfig)
        .then(response => response.json())
        .then( data => {
          console.log(data);
          Swal.fire({
            icon: 'success',
            text: data.message,
          });
          location.reload();
        })
        .catch(error => {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: error.message,
          })
        });
    }
    
  }

  document.getElementById("DeleteChatButton").addEventListener('click', deleteChat);

// switch between chats
function changeChat(chatName) {
  let selectedChat = chatName;
  const requestConfig = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({chatName: selectedChat}),
  };
  console.log(requestConfig);
  fetch('/changeChat', requestConfig)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const newChat = data;
      // switch
      currentGroup = newChat;
      console.log("User: " + user.username +" switched to chat "+ currentGroup.chatName);

      usersList = document.querySelector('#users');
      usersList.innerHTML = "";
      chatNameBox = document.getElementById("chat-name-box");
      chatNameBox.textContent = currentGroup.chatName;
      document.querySelector('.chat-messages').innerHTML = "";

      usersInChat = [];

      // adding members from current chat
      // reinitialize chat members
      currentGroup.members.forEach(member => {
        usersInChat.push(member);
      });

      outputUsers(usersInChat);
    
      // get chat history
      outputMessages(currentGroup.messages);
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message,
      })
  });
}

function showMessage(message)
{
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.sender} <span>${message.sendAt} </span></p>
  <p class="text">
    ${message.message}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputMessages(messages)
{
  if(messages.length === 0) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${'Admin'} <span></span></p>
    <p class="text">
      ${'No previous history available'}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
  }
  else {
    console.log(messages);
    messages.forEach(message => {
      const div = document.createElement('div');
      div.classList.add('message');
      div.innerHTML = `<p class="meta">${message.sender} <span>${message.sendAt} </span></p>
      <p class="text">
        ${message.message}
      </p>`;
      document.querySelector('.chat-messages').appendChild(div);
    });
  }
}

// show all available rooms
function outputRooms(rooms)
{
  rooms.forEach(room => {
   
    const listItem = document.createElement('li');
    if(room === currentGroup.chatName)
    {
      listItem.classList.add("selected"); 
    }

    listItem.textContent = room;
    roomsList.appendChild(listItem);
  });
}

// show room name
function outputRoomName(room)
{
  roomName.innerText = room;
}

// shows users
function outputUsers(users)
{
  usersList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}`;
}
