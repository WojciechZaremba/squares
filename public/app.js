const socket = io()

const defaultSq = document.getElementById("defaultSq")
const container = document.getElementById("sqrsContainer")
const usersBox = document.getElementById("usersBox")

socket.on("connect", () => {
    console.log("connected to the server")
    console.log("your ID is:")
    console.log(socket.id)
})

socket.on("initialState", state => renderInitialState(state))

socket.on("test", arg => console.log(arg))

socket.on("square", arg => drawSquare(arg))

socket.on("shift", ereaseOldestSquare)

socket.on("usersUpdate", arg => updateUsersBox(arg))

function renderInitialState(state) {
    fadingQueue.length = 0
    container.childNodes.length = 0
    if (state.length) {
        state.forEach(square => {
            drawSquare(square)
        });
    } else {
        console.log("page is empty")
    }
}

function drawSquare(arg) {
    const square = document.createElement("div")
    square.classList.add("square")
    square.style.marginLeft = `${arg[0]}px`
    square.style.marginTop = `${arg[1]}px`
    square.style.background = `#${arg[2]}`
    
    container.appendChild(square)
}

const fadingQueue = []
function ereaseOldestSquare() {
    //console.log("shift")
    if (container.childNodes.length) {
        fadingQueue.push(container.childNodes[fadingQueue.length])
    }
    
    // if (typeof fadingQueue[fadingQueue.length - 1] !== "undefinded") {
        // if (fadingQueue.length > 0) { 
    if (fadingQueue[fadingQueue.length - 1]) {
        fadingQueue[fadingQueue.length - 1].style.transition = "opacity .5s ease-in-out"
        fadingQueue[fadingQueue.length - 1].style.opacity = 0

    }
    setTimeout(() => {
        if (typeof fadingQueue[0] === "undefined") {
            fadingQueue.length = 0
            container.childNodes.length = 0 
            console.error("error: ''undefined'' occured in fadingQueue")
            socket.emit("askForHelp")
            return
        }
        container.removeChild(fadingQueue[0])
        fadingQueue.shift()
    }, 500); 
}

function updateUsersBox(users) {
    const nodes = usersBox.childNodes
    const nodesId = [...nodes].map(a => a.id)
    for (user of users) {
        if (nodesId.indexOf(user) < 0) {
            const userAvatar = document.createElement("div")
            userAvatar.setAttribute("id", user)
            userAvatar.classList.add("userAvatar")
            const color = `#${Math.floor(Math.random()*16777215).toString(16)}`
            userAvatar.style.background = color
            usersBox.appendChild(userAvatar)
            if (user === socket.id) {
                userAvatar.style.boxShadow = "0px 0px 5px 0px #000000"
            }
        }
    }
    for (node of nodesId) {
        if (users.indexOf(node) < 0) {
            const avatarToRemove = document.getElementById(node)
            usersBox.removeChild(avatarToRemove)
        }
    }
}
    
function createNewSquare(e) {
    const userInfo = squarePosAndColor(e)
    if (userInfo) socket.emit("position", userInfo)   
}
    
let autoDrawingInterval = false
    
// let timer = 0
// function handleMove(e) {
//     if (timer === 20) {
//         createNewSquare(e)
//     } else if (timer > 100) {
//         timer = 0
//     }
//     timer++
// }

const dummyEvent = {}
dummyEvent.target = container
dummyEvent.offsetX = 0
dummyEvent.offsetY = 0

function handleMove(e) {
    e.preventDefault()
    console.log(e.type)
    if (e.type === "mousemove") {
        e.preventDefault()
        dummyEvent.offsetY = e.clientY - container.getBoundingClientRect().top
        dummyEvent.offsetX = e.clientX - container.getBoundingClientRect().left
    } else if (e.type === "touchmove") {
        e.preventDefault()
        dummyEvent.offsetY = e.touches[0].clientY - container.getBoundingClientRect().top
        dummyEvent.offsetX = e.touches[0].clientX - container.getBoundingClientRect().left
    }
}

let dummyInterval

let isMouseDown = false
function handleControls(e) {
    if (e.type === "mousedown") {
        console.log(e)
        console.log("mouse down")
        isMouseDown = true
        createNewSquare(e)
        addEventListener("mousemove", handleMove)
        dummyEvent.offsetY = e.clientY - container.getBoundingClientRect().top
        dummyEvent.offsetX = e.clientX - container.getBoundingClientRect().left

        setTimeout(() => {
            if (isMouseDown && !dummyInterval) dummyIntervalSetter()
        }, 35);
    } else if (e.type === "touchstart") {
        e.preventDefault()
        console.log("touch down")
        console.log(e)
        isMouseDown = true

        dummyEvent.target = e.target
        dummyEvent.offsetY = e.touches[0].clientY - container.getBoundingClientRect().top
        dummyEvent.offsetX = e.touches[0].clientX - container.getBoundingClientRect().left

        createNewSquare(dummyEvent)
        addEventListener("touchmove", handleMove)

        setTimeout(() => {
            if (isMouseDown && !dummyInterval) dummyIntervalSetter()
        }, 35);
    } else {
        console.log("up")
        isMouseDown = false
        removeEventListener("mousemove", handleMove)
        clearInterval(dummyInterval)
        dummyInterval = false
    }
}

function dummyIntervalSetter() {
    dummyInterval = setInterval(() => {
        if (!isMouseDown) { // this is safety valve ### DOESN'T WORK WHEN MOUSEUP NOT DETECTED ###
            removeEventListener("mousemove", handleMove)
            clearInterval(dummyInterval)
            dummyInterval = false
            return
        }
            createNewSquare(dummyEvent)
            setTimeout(() => { // add some variety in the tail pattern
                createNewSquare(dummyEvent)
            }, 22);
    }, 80);
}

function squarePosAndColor(e) {
    if (e.target !== container && !e.target.classList.contains("square")) {
        console.log("no")
        return false
    }

    let x, y, color
    color = Math.floor(Math.random()*16777215).toString(16)

    if (e.target === container) {
        x = e.offsetX - 25
        y = e.offsetY - 25
    } else {
        x = e.offsetX + parseInt(e.target.style.marginLeft) - 25
        y = e.offsetY + parseInt(e.target.style.marginTop) - 25
    }
    
    if (x < 0) { x = 0 }
    else if (x > 450) { x = 450 };
    if (y < 0) { y = 0 }
    else if (y > 450) { y = 450 };
    
    return [x, y, color]
}


document.addEventListener("mousedown", handleControls)
document.addEventListener("mouseup", handleControls)

document.addEventListener("touchstart", handleControls)
document.addEventListener("touchend", handleControls)