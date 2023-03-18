const express = require("express");
const app = express();
const server = require("http").createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('index.html')
})


const userOrder = {
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
const orderHistory = []

const welcome = `<p>Welcome to ALLAHisrabb restaurant, select:</p>
<p> 1 to Place an order</p>
<p>Send 99 to checkout order</p>
<p>Send 98 to see order history</p>
<p>Send 97 to see current order</p>
<p>Send 0 to cancel order</p>`;

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

function inputPhoneNumber(paymentType){
  return `<p>You have chosen to pay with <strong>${paymentType}</strong></p><br>
  Further messages regarding your ${paymentType} payment will be forwarded to your  phone number<br>
  please input your phone number
  <p>send 0 to cancel order</p>`
}

//step6 message

function checkoutMessage(product, price, location, dprice, paymentType, phoneNumber){
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

  function emitError() {
    return socket.emit("error", "please give valid order!");
  }

  socket.on("joined", (message) => {
    console.log(message);
    socket.emit("welcome", welcome);
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
      if(messageValue == 99){
        socket.emit('invalidCheckout', 'you are currently not ordering anything!');
        socket.emit('order', `<p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        return;
      }
      if(messageValue == 98){
        socket.emit('orderHistory', JSON.stringify(orderHistory));
        socket.emit('order', `<p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        return;
      }
      if(messageValue == 97){
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
        userOrder.source = "jollof";
        return;
      }
      if (messageValue == 2) {
        socket.emit("order", fried);
        userOrder.source = "fried";
        return;
      }
      if (messageValue == 3) {
        socket.emit("order", swallow);
        userOrder.source = "swallow";
        return;
      }
      if (messageValue == 4) {
        socket.emit("order", chicken);
        userOrder.source = "chicken";
        return;
      }
      if (messageValue == 5) {
        socket.emit("order", diary);
        userOrder.source = "diary";
        return;
      }
    }
    if (step == 3) {
      if (userOrder.source == "jollof") {
        if (messageValue == 1) {
          userOrder.product = "jollof & meat";
          userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          userOrder.product = "jollof & chiken";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
      }
      if (userOrder.source == "fried") {
        if (messageValue == 1) {
          userOrder.product = "fried & meat";
          userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          console.log(userOrder)
          return;
        }
        if (messageValue == 2) {
          userOrder.product = "fried & chiken";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
      }
      if (userOrder.source == 'swallow'){
        if (messageValue == 1) {
          userOrder.product = "eba & meat";
          userOrder.productPrice = "1500";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          userOrder.product = "eba & chiken";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          userOrder.product = "amala & meat";
          userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 4) {
          userOrder.product = "amala & chiken";
          userOrder.productPrice = "4000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 5) {
          userOrder.product = "semo & meat";
          userOrder.productPrice = "4500";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 6) {
          userOrder.product = "semo & chiken";
          userOrder.productPrice = "5400";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 7) {
          userOrder.product = "fufu & meat";
          userOrder.productPrice = "1600";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 8) {
          userOrder.product = "fufu & chiken";
          userOrder.productPrice = "4000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
      }
      if(userOrder.source == 'chicken'){
        if (messageValue == 1) {
          userOrder.product = "full spicy chicken";
          userOrder.productPrice = "9000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          userOrder.product = "half spicy chicken";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          userOrder.product = "full fried chicken";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 4) {
          userOrder.product = "half fried chicken";
          userOrder.productPrice = "3000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
      }
      if(userOrder.source == 'diary'){
        if (messageValue == 1) {
          userOrder.product = "pure milk";
          userOrder.productPrice = "1500";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 2) {
          userOrder.product = "yoghurt";
          userOrder.productPrice = "5000";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
        if (messageValue == 3) {
          userOrder.product = "cheese";
          userOrder.productPrice = "5500";
          socket.emit(
            "order",
            orderMessage(userOrder.product, userOrder.productPrice)
          );
          return;
        }
      }
    }
    if (step == 4) {
        if (messageValue == 1) {
          userOrder.deliveryPrice = "300";
          userOrder.deliveryLocation = "your doorstep";
          socket.emit(
            "order",
            paymentMessage(
              Number(
                Number(userOrder.productPrice) + Number(userOrder.deliveryPrice)
              )
            )
          );
          return;
        }
        if (messageValue == 2) {
          userOrder.deliveryPrice = "0";
          userOrder.deliveryLocation = "nearest branch of the company";
          socket.emit(
            "order",
            paymentMessage(
              Number(
                Number(userOrder.productPrice) + Number(userOrder.deliveryPrice)
              )
            )
          );
          return;
        }
    }
    if(step == 5){

        if(messageValue == 1){
          userOrder.totalPrice = Number(userOrder.productPrice) + Number(userOrder.deliveryPrice);
          userOrder.paymentType = "debit card"
          socket.emit('order', inputPhoneNumber(userOrder.paymentType));
          return;
        }
        if(messageValue == 2){
          userOrder.paymentType = 'cash'
          socket.emit('order', inputPhoneNumber(userOrder.paymentType))
          return;
        }

    }
    if(step == 6){
      userOrder.phoneNumber = messageValue;
      const {product, productPrice, deliveryLocation, deliveryPrice, paymentType, phoneNumber} = userOrder
      socket.emit('order', checkoutMessage(product, productPrice, deliveryLocation, deliveryPrice, paymentType, phoneNumber));
      return;
    }
    if(step == 7){
      if(messageValue == 99){
        socket.emit('order', '<strong>congratulations!</strong><br> You have successfully placed your order. Thanks for your patience and cooperation. We shall get back to you shortly!');
        orderHistory.push(userOrder);
        socket.emit('newOrder', `<p style="font-weight: bold">Give new order!<p><br>
        <p> 1 to Place an order</p>
        <p>Send 99 to checkout order</p>
        <p>Send 98 to see order history</p>
        <p>Send 97 to see current order</p>
        <p>Send 0 to cancel order</p>`)
        console.log(orderHistory);
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
