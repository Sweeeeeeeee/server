const optionCount = 7

let game = null
let openedFile = ""
let currentType = ""
let isWaiting = false
let lastResult = null

function renderUI() {
    let questionDisplay = document.getElementById("questionDisplay")
    let answersContainer = document.getElementById("answersContainer")
    let inputContainer = document.getElementById("inputContainer")
    let nextBtn = document.getElementById("nextBtn")
    
    document.getElementById("scoreDisplay").innerText = game.scoreGet().toFixed(3)
    
    if (isWaiting) {
        questionDisplay.innerText = lastResult.t
        answersContainer.classList.add("hide")
        inputContainer.classList.add("hide")
        nextBtn.classList.remove("hide")

        return
    }
    
    nextBtn.classList.add("hide")
    
	questionDisplay.innerText = game.get1()

    if (currentType === "T") { 
		answersContainer.classList.add("hide")
        inputContainer.classList.remove("hide")
        document.getElementById("textInput").value = ""
        document.getElementById("textInput").focus()
    }else {
        inputContainer.classList.add("hide")
        answersContainer.classList.remove("hide")
        answersContainer.innerHTML = ""
            
		let options = [];
		
        let wasmOptions = game.get2(optionCount)
		for (let i = 0; i < wasmOptions.size(); i++) {
    		options.push(wasmOptions.get(i));
		}
		wasmOptions.delete();

        options.forEach(opt => {
                let btn = document.createElement("button")
                btn.innerText = opt
                btn.onclick = function() {
                    lastResult = game.answer(opt)
                    isWaiting = true
                    renderUI()
                }
                answersContainer.appendChild(btn)
            }
        )
    }
}

async function initGame(dir, len, type) {
    let file
    
    if (dir === "EK") {
        if (len === "1") {
            file = "etok.json"
        }else if (len === "2") {
            file = "eetokk.json"
        }else {
            file = "eeetokkk.json"
        }
    }else {
        if (len === "1") {
            file = "ktoe.json"
        }else if (len === "2") {
            file = "kktoee.json"
        }else {
            file = "kkktoeee.json"
        }
    }
    
    let response = await fetch("/keData/" + file)
    let activeData = await response.json()
        
    game = new Module.Ke(JSON.stringify(activeData))
    openedFile = file
    currentType = type
    isWaiting = false

    document.getElementById("selection").classList.add("hide")
    document.getElementById("gameContainer").classList.remove("hide")
    
    renderUI()
}

document.getElementById("startBtn").onclick = function() {
    let dir = document.getElementById("dirSelect").value
    let length = document.getElementById("lenSelect").value
    let type = document.getElementById("modeSelect").value
    
	initGame(dir, length, type)
}

document.getElementById("submitBtn").onclick = function() {
	lastResult = game.answer(document.getElementById("textInput").value)
    isWaiting = true

    renderUI()
}

document.getElementById("textInput").onkeydown = function(e) {
    if (e.key === "Enter") {
		lastResult = game.answer(document.getElementById("textInput").value)
    	isWaiting = true

    	renderUI()
    }
}

document.getElementById("nextBtn").onclick = function() {
    isWaiting = false

    renderUI()
}

document.getElementById("backBtn").onclick = function() {
    game = null
    isWaiting = false
    
    document.getElementById("gameContainer").classList.add("hide")
    document.getElementById("selection").classList.remove("hide")
}

