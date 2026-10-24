function isMarked(todo) {
    if (!todo.markedDate) {
        return false
    }
        
    const start = new Date(todo.date)
    const marked = new Date(todo.markedDate)
    const today = new Date(new Date().toISOString().split('T')[0])
    
    const duration = parseInt(todo.duration, 10)

    const ms = 24 * 60 * 60 * 1000
    const sinceStart = Math.floor(today - start)
    const currentIndex = Math.floor(sinceStart / (duration * ms))
    const currentStartDate = new Date(start.getTime() + (currentIndex * duration * ms))

    return marked > currentStartDate
}

async function update(todo) {
    await fetch("/api/todo/update", {
        	method: "POST",
        	headers: {"Content-Type": "application/json"},
        	body: JSON.stringify(todo)
    	}
	)

    render()
}

async function render() {
    const todosContainer = document.querySelector(".todos")
    const addTodoContainer = document.querySelector(".addTodo")

	todosContainer.innerHTML = ""
    
	const response = await fetch("/api/todo")
    const todos = await response.json()
	todos.forEach(todo => {
        	const el = document.createElement(`div`)

			let checked = "" 
        	let permanentTrueSelected = ""
        	let permanentFalseSelected = ""

    		if (isMarked(todo)) {
            	el.className = "todoItem marked"
				checked = "checked"
        	}else {
            	el.className = "todoItem unmarked"
        	}

        	if (todo.permanent === "true") {
            	permanentTrueSelected = "selected"
        	}else {
            	permanentFalseSelected = "selected"
        	}

        	el.innerHTML = 
            	`
                	<div class = "todoContent">
                    	<input class = "todoMark" type = "checkbox" ${checked}>
                    	<input class = "todoTextInput" type = "text" value = "${todo.text}">
                    	<div class = "todoDetails">
                        	<div id = "duration">
								<div id = "durationTitle"> </div>
                            	<input type = "number" class = "todoDuration" value = "${todo.duration}">
                        	</div>
                        	<div id = "permanent">
                            	<select class = "todoPermanent">
									<div id = "permanentTitle"> </div>
                                	<option id = "permanentTrue" value = "true" ${permanentTrueSelected}> </option>
                                	<option id = "permanentFalse" value = "false" ${permanentFalseSelected}> </option>
                            	</select>
                        	</div>
                    	</div>
                	</div>
        
                	<button id = "todoDelete" class = "todoDelete"> </button>
            	`

			el.querySelector(".todoMark").addEventListener("change", (e) => {
        			let todayStr = ""
        			if (e.target.checked) {
            			todayStr = new Date().toISOString().split('T')[0]
        			}

        			update({...todo, markedDate: todayStr})
    			}
			)

    		el.querySelector(".todoTextInput").addEventListener("blur", (e) => {
        			if (e.target.value != todo.text) {
            			update({...todo, text: e.target.value})
        			}
    			}
			)

    		el.querySelector(".todoDuration").addEventListener("change", (e) => {
            		if (e.target.value && (e.target.value != todo.duration)) {
               	 		update({...todo, duration: e.target.value})
        			}
    			}
			)

    		el.querySelector(".todoPermanent").addEventListener("change", (e) => {
        			update({...todo, permanent: e.target.value})
    			}
			)

    		el.querySelector(".todoDelete").addEventListener("click", async () => {
        			await fetch(`/api/todo/delete?id=${todo.id}`, {
            				method: "POST",
            				headers: {"Content-Type": "application/json"},
        				}
					)

					render()
    			}
			)
        
			todosContainer.appendChild(el)
		}
	)

    addTodoContainer.innerHTML = 
    `
        <div class = "addTodoForm">
            <input id = "newText" type = "text">
            <input id = "newDuration" type = "number" value = "1" min = "1">
            <select id = "newPermanent">
                <option id = "newPermanentTrue" value = "true"> </option>
                <option id = "newPermanentFalse" value = "false"> </option>
            </select>
            <button id = "submitTodo"> </button>
        </div>
    `

    document.getElementById("submitTodo").addEventListener("click", async () => {
			const date = new Date().toISOString().split('T')[0]
    		const duration = document.getElementById("newDuration").value
    		const permanent = document.getElementById("newPermanent").value
    		const text = document.getElementById("newText").value

    		const todo = {
        		username: "",
        		date: date,
	        	markedDate: "",
    	    	duration: duration,
        		permanent: permanent,
        		text: text
    		}

    		await fetch("/api/todo/add", {
        			method: "POST",
        			headers: {"Content-Type": "application/json"},
        			body: JSON.stringify(todo)
    			}
			)
    
    		render()
		}
	)

	import("./i18n.js").then((module) => {module.load();})
}

document.addEventListener("DOMContentLoaded", render)
