const express = require("express")
const socket = require("socket.io")

const app = express()
app.use(express.static("public"))

const server = app.listen(3000, () => {
  console.log("listening on 3000")
})

const io = socket(server)

const squares = []
const remain = 5000
const maximum = 1000

let users = []

io.on("connection", (socket) => {
  console.log("sb connected with id:")
  console.log(socket.id)

  users.push(socket.id)
  console.log(users)
  io.emit("usersUpdate", users)
  
  socket.emit("initialState", squares)

  socket.on("position", (arg)=>{
    handleNewSquare(arg)
    io.emit("square", arg)
  })

  socket.emit("test", "hello")

  socket.on("disconnect", () => {
    console.log("somebody just left")
    console.log(socket.id + " disconnected")
    users = users.filter((user) => {
      return user != socket.id
    })
    console.log(users)
    io.emit("usersUpdate", users)
  })

  socket.on("ask", () => {
    console.log(squares)
    socket.emit(squares)
  })

  socket.on("askForHelp", () => {
    socket.emit("initialState", squares)
  })

  socket.on("testingMessage", (arg) => {
    console.log(arg)
  })
})

function handleNewSquare(arg) {
  //console.log(arg)
  squares.push(arg)
  setTimeout(() => {
    squares.shift()
    io.emit("shift")
  }, remain);
  if (squares.length > maximum) {
    squares.shift()
    io.emit("shift")
  }
  //console.log(squares)
}