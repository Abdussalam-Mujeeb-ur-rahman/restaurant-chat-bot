const express = require("express");
const app = express();
const server = require("http").createServer(app);
const session = require('express-session')

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  cookie: false
});

const sessionMiddleware = session({
  secret: 'session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 600 }
})

app.use(sessionMiddleware)

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
})

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('index.html')
})





function welcome(username) {
  return `
  <p>Hello <strong>${username}</strong></p>
  <p>Welcome to ALLAHisrabb restaurant, select:</p>
<p> 1 to Place an order</p>
<p>Send 99 to checkout order</p>
<p>Send 98 to see order history</p>
<p>Send 97 to see current order</p>
<p>Send 0 to cancel order</p>`;
}

//step1 messages
const orders = `<p>1 - Jollof rice</p>
<p> 2 - fried rice</p>
<p>3 - swallow</p>
<p>4 - chicken</p>
<p>5 - diary</p>
<p>Send 0 to cancel order</p>
`;

const cancel = `<p style="font-weight: bold">Order cancelled!<p><br>
<p> 1 to Place an order</p>
<p>Send 99 to checkout order</p>
<p>Send 98 to see order history</p>
<p>Send 97 to see current order</p>
<p>Send 0 to cancel order</p>`;

// function ordersHistory(orders) {
//   if(orders == {}){
//      let message = `You currently do not have orders`
//      return message;
//   }

   
//   orders.forEach(order => {
//     let message = ""
//     message += ` <ol>
//       <li>${order.entries}</li>
//     </ol>`
//     return message;
//   })
//   return ;

// }

//step2 messages
const jollof = ` <li>1 - jollof & meat: 3000</li>
  <li>2 - jollof & chicken: 5000</li>
  <p>send 0 to cancel order</p>`;

const fried = ` <li>1 - fried & meat: 3000</li>
   <li>2 - fried & chicken: 5000</li>
   <p>send 0 to cancel order</p>`;

const swallow = ` <li>1 - eba & meat: 1500</li>
  <li>2 - eba & chicken: 5000</li>
  <li>3 - amala & meat: 3000</li>
  <li>4 - amala & chicken: 4000</li>
  <li>5 - semo & meat: 4500</li>
  <li>6 - eba & chicken: 5400</li>
  <li>7 - fufu & meat: 1600</li>
  <li>8 - fufu & chicken: 4000</li>
  <p>send 0 to cancel order</p>`;

const chicken = ` <li>1 - full spicy chicken: 9000</li>
   <li>2 - half spicy chicken: 5000</li>
   <li>3 - full fried chicken: 5000</li>
   <li>4 - half fried chicken: 3000</li>
   <p>send 0 to cancel order</p>`;

const diary = `
   <li>1 - pure milk: 1500</li>
   <li>2 - yoghurt: 5000</li>
   <li>3 - cheese: 5500</li>
   <p>send 0 to cancel order</p>
   `;

//  step3 messages
function orderMessage(product, product_price) {
  return `<p>you have selected <strong>${product}</strong> with the price of <strong>${product_price}</strong></p><br>
    <p>The product will be delivered at:</p>
    <li>1 - your doorstep: 300</li>
    <li>2 - nearest branch of the company: 0</li>
    <p>send 0 to cancel order</p>`;
}

//step4 messages
function paymentMessage(price) {
  return `you are to pay the sum of ${price}<br>
    <p>Pay with:</p>
    <li>1 - Debit card</li>
    <li>2 - cash</li>
    <p>send 0 to cancel order</p>`;
}

//step5 messages

function inputPhoneNumber(paymentType) {
  return `<p>You have chosen to pay with <strong>${paymentType}</strong></p><br>
  Further messages regarding your ${paymentType} payment will be forwarded to your  phone number<br>
  please input your phone number
  <p>send 0 to cancel order</p>`
}

//step6 message

function checkoutMessage(product, price, location, dprice, paymentType, phoneNumber) {
  return `<p>Product: ${product}</p>
  <p>Product price: ${price}</p>
  <p>Delivery location: ${location}</p>
  <p>Delivery cost: ${dprice}</p>
  <p>Payment type: ${paymentType}</p>
  <p>Phone number: ${phoneNumber}</p><br>
  <p>Send 99 to checkout order</p>
  <p>Send 0 to cancel order</p>`
}

//emit error function

io.on("connection", (socket) => {
  console.log(`user connected! ${socket.id}`);

  socket.request.userOrder = {
    source: "",
    product: "",
    productPrice: "",
    deliveryLocation: "",
    deliveryPrice: "",
    totalPrice: "",
    paymentType: "",
    phoneNumber: "",
    date: new Date()
  };

  socket.request.orderHistory = {};
  socket.request.orderNumber = 0

  function emitError() {
    return socket.emit("error", "please give valid order!");
  }

  socket.on("joined", ({ message, username }) => {
    socket.emit("welcome", welcome(username));
    socket.request.username = username;
  });

  socket.on("chat", ({ messageValue, step }) => {
    if (messageValue == 0) {
      socket.emit("cancel", cancel);
      return;
    }
    if (step == 0) {
      socket.emit("welcome", welcome);
      return;
    }
    if (step == 1) {
      if (messageValue == 1) {
        socket.emit("order", orders);
        return;
      }
      if (messageValue == 99) {
        socket.emit('invalidCheckout', 'you are currently not ordering anything!');
        socket.emit('order', `<p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        return;
      }
      if (messageValue == 98) {
        socket.emit('orderHistory', JSON.stringify(socket.request.orderHistory));
        socket.emit('order', `<p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        return;
      }
      if (messageValue == 97) {
        socket.emit('orderHistory', 'no current order!');
        socket.emit('order', `<p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        return;
      }
    }
    if (step == 2) {
      if (messageValue == 1) {
        socket.emit("order", jollof);
        socket.request.userOrder.source = "jollof";
        return;
      }
      if (messageValue == 2) {
        socket.emit("order", fried);
        socket.request.userOrder.source = "fried";
        return;
      }
      if (messageValue == 3) {
        socket.emit("order", swallow);
        socket.request.userOrder.source = "swallow";
        return;
      }
      if (messageValue == 4) {
        socket.emit("order", chicken);
        socket.request.userOrder.source = "chicken";
        return;
      }
      if (messageValue == 5) {
        socket.emit("order", diary);
        socket.request.userOrder.source = "diary";
        return;
      }
    }
    if (step == 3) {
      if (socket.request.userOrder.source == "jollof") {
        if (messageValue == 1) {
          socket.request.userOrder.product = "jollof & meat";
          socket.request.userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          socket.request.userOrder.product = "jollof & chiken";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
      }
      if (socket.request.userOrder.source == "fried") {
        if (messageValue == 1) {
          socket.request.userOrder.product = "fried & meat";
          socket.request.userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          socket.request.userOrder.product = "fried & chiken";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
      }
      if (socket.request.userOrder.source == 'swallow') {
        if (messageValue == 1) {
          socket.request.userOrder.product = "eba & meat";
          socket.request.userOrder.productPrice = "1500";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          socket.request.userOrder.product = "eba & chiken";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          socket.request.userOrder.product = "amala & meat";
          socket.request.userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 4) {
          socket.request.userOrder.product = "amala & chiken";
          socket.request.userOrder.productPrice = "4000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 5) {
          socket.request.userOrder.product = "semo & meat";
          socket.request.userOrder.productPrice = "4500";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 6) {
          socket.request.userOrder.product = "semo & chiken";
          socket.request.userOrder.productPrice = "5400";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 7) {
          socket.request.userOrder.product = "fufu & meat";
          socket.request.userOrder.productPrice = "1600";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 8) {
          socket.request.userOrder.product = "fufu & chiken";
          socket.request.userOrder.productPrice = "4000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
      }
      if (socket.request.userOrder.source == 'chicken') {
        if (messageValue == 1) {
          socket.request.userOrder.product = "full spicy chicken";
          socket.request.userOrder.productPrice = "9000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          socket.request.userOrder.product = "half spicy chicken";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          socket.request.userOrder.product = "full fried chicken";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 4) {
          socket.request.userOrder.product = "half fried chicken";
          socket.request.userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
      }
      if (socket.request.userOrder.source == 'diary') {
        if (messageValue == 1) {
          socket.request.userOrder.product = "pure milk";
          socket.request.userOrder.productPrice = "1500";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          socket.request.userOrder.product = "yoghurt";
          socket.request.userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          socket.request.userOrder.product = "cheese";
          socket.request.userOrder.productPrice = "5500";
          socket.emit(
            "order",
            orderMessage(socket.request.userOrder.product, socket.request.userOrder.productPrice)
          );
          return;
        }
      }
    }
    if (step == 4) {
      if (messageValue == 1) {
        socket.request.userOrder.deliveryPrice = "300";
        socket.request.userOrder.deliveryLocation = "your doorstep";
        socket.emit(
          "order",
          paymentMessage(
            Number(
              Number(socket.request.userOrder.productPrice) + Number(socket.request.userOrder.deliveryPrice)
            )
          )
        );
        return;
      }
      if (messageValue == 2) {
        socket.request.userOrder.deliveryPrice = "0";
        socket.request.userOrder.deliveryLocation = "nearest branch of the company";
        socket.emit(
          "order",
          paymentMessage(
            Number(
              Number(socket.request.userOrder.productPrice) + Number(socket.request.userOrder.deliveryPrice)
            )
          )
        );
        return;
      }
    }
    if (step == 5) {

      if (messageValue == 1) {
        socket.request.userOrder.totalPrice = Number(socket.request.userOrder.productPrice) + Number(socket.request.userOrder.deliveryPrice);
        socket.request.userOrder.paymentType = "debit card"
        socket.emit('order', inputPhoneNumber(socket.request.userOrder.paymentType));
        return;
      }
      if (messageValue == 2) {
        socket.request.userOrder.paymentType = 'cash'
        socket.emit('order', inputPhoneNumber(socket.request.userOrder.paymentType))
        return;
      }

    }
    if (step == 6) {
      socket.request.userOrder.phoneNumber = messageValue;
      const { product, productPrice, deliveryLocation, deliveryPrice, paymentType, phoneNumber } = socket.request.userOrder
      socket.emit('order', checkoutMessage(product, productPrice, deliveryLocation, deliveryPrice, paymentType, phoneNumber));
      return;
    }
    if (step == 7) {
      if (messageValue == 99) {
        socket.emit('order', '<strong>congratulations!</strong><br> You have successfully placed your order. Thanks for your patience and cooperation. We shall get back to you shortly!');

        socket.emit('newOrder', `<p style="font-weight: bold">Give new order!<p><br>
        <p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`);


        socket.request.orderHistory['order' + (socket.request.orderNumber + 1)] = socket.request.userOrder;

        socket.request.orderNumber++;
        console.log(socket.request.orderHistory)
        return;
      }
    }
    return emitError();
  });

  socket.on("exituser", () => {
    socket.disconnect();
  });
});

app.use((error, req, res, next) => {
  console.log("Error handling middleware called");
  console.log(`path: ${req.path}`);
  console.error(`error: ${error}`);
  next();
});

module.exports = server;
