const socket = io("https://restaurant-chat-bot.onrender.com");

(function () {
  const app = document.querySelector(".app");

  app
    .querySelector(".join-screen #join-user")
    .addEventListener("click", function () {
      console.log("joined");
      console.log(socket.id);
      socket.emit("joined", "user joined!");

      app.querySelector(".join-screen").classList.remove("active");
      app.querySelector(".chat-screen").classList.add("active");
    });

    let step = 1;

  socket.on("welcome", (message) => {
    renderMessage("other", message);

    app.querySelector("#send-message").addEventListener("click", (e) => {


    let messageValue = app.querySelector("#message-input").value;

      if (messageValue.length === 0) {
        return;
      }
      renderMessage("my", {
        text: messageValue
      });
      socket.emit("chat", {messageValue, step});
      app.querySelector("#message-input").value = "";
      step++;
    });
  });

  socket.on('cancel', (cancel) => {
    renderMessage("other", cancel);
    socket.on('welcome', welcome => {
      renderMessage("other", welcome)
    })
    step = 1;
  })

  socket.on('newOrder', (cancel) => {
    renderMessage("other", cancel);
    step = 1;
  })

  socket.on('invalidCheckout', (cancel) => {
    renderMessage("other", cancel);
    step = 1;
  })

  socket.on('orderHistory', (cancel) => {
    renderMessage("other", cancel);
    step = 1;
  })
  
  socket.on('order', (orders) => {
    renderMessage("other", orders)
  });

socket.on('error', error => {
    renderMessage("other", error);
    step--;
  })


  app.querySelector("#exit-chat").addEventListener("click", (e) => {
    socket.emit("exituser");
    window.location.href = window.location.href;
  });

  function renderMessage(type, message) {
    let messageContainer = app.querySelector(".messages");
    if (type === "my") {
      let el = document.createElement("div");
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
               <div>
                  <div class="name">You</div>
                  <div class="text">${message.text}</div>
               </div>
            `;
      messageContainer.appendChild(el);
    } else if (type === "other") {
      let el = document.createElement("div");
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
               <div>
                  <div class="name">bot</div>
                  <div class="text">${message}</div>
               </div>
            `;
      messageContainer.appendChild(el);
    }
    //scroll chat to end
    messageContainer.scrollTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }


})();

