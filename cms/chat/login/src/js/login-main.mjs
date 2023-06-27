window.addEventListener('load', () => {
  // fetch('/rooms') 
  // .then( response => response.json())
  // .then( data => {
  //   console.log(data);
  //   const rooms = data.rooms;

  //   console.log('All possible rooms:', rooms);

  //   const selectElement = document.querySelector('.minimal');

  //   // Create an option element for each room
  //   for(const element of rooms)
  //   {
  //     const optionElement = document.createElement('option');
  //     optionElement.textContent = element;
  //     optionElement.value = element;
  //     selectElement.add(optionElement);
  //   }

  // }).catch(error => {
  //   console.error(error);
  // });
  })
 
  const loginForm = document.querySelector('.form');
  const signUp = document.querySelector('.signup-link');
  
  // entering chat
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userNameField = document.querySelector('#username');
   
    if(userNameField.value === "") {
      alert("Enter username");
    } else {
        console.log(userNameField.value);
        const newUser = {
        username : userNameField.value,
      }

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({user: newUser})
      };

      // checking if user exists in db
      // fetch('/exists', requestOptions)
      // .then(response => response.json())
      // .then(data => {
      //   // Handle the response from the server
      //   console.log('Server response:', data);
      //   if(data.message === true)
      //   {
      //     alert('success');
      //     // loginForm.submit();
      //     // window.location.href = `/chat/chat.html?username=${encodeURIComponent(username)}&room=${encodeURIComponent(selectedRoom)}`;
      //   }
      //   else
      //   {
      //     alert('incorrect username');
      //   }
      // }).catch(error => {
      //   console.error('Error:', error);
      // });
      fetch('/logIn', requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log("LogIn returned", data);
          sessionStorage.setItem('currentUser', JSON.stringify(data));
          console.log('Successful login');
          window.location.href = `/chat/chat.html`;
        }).catch(error => {
            console.error('Error:', error);
        });
    }
  });

  // registration in chat
  signUp.onclick = () => {
    const userNameField = document.querySelector('#username');
   
    if(userNameField.value === "") {
      alert("Enter username");
    } else {
        const newUser = {
        username : userNameField.value,
      }
      // forming request to server
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({user: newUser})
      };

      // sending this request
      fetch('/signUp', requestOptions)
        .then(response => response.json())
        .then(data => {
           console.log("SignUp returned", data);

           // adding user to session storage to know who entered chat
           sessionStorage.setItem('currentUser', JSON.stringify(data));
           window.location.href = '/chat/chat.html';
           console.log('Successful signup');

        }).catch(error => {
            console.error('Error:', error);
      });
    }
   

  };