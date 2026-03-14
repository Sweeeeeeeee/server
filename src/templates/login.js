function login() {
	const username = document.getElementById("username").value
	const password = document.getElementById("password").value

	fetch("/api/login", {
    		method: "POST",
    		headers: { "Content-Type": "application/json" },
    		body: JSON.stringify({username: username, password: password})
  		}
	).then(res => {
        	if (!res.ok) {
				throw new Error("Unauthorized")
			}
		}
    ).then(data => {
        	window.location.href = "/"
		}
	).catch(err => {
        	alert("Login failed")
        	console.error(err)
    	}
	)
}

function bind() {
	const form = document.getElementById("loginForm")
	form.addEventListener("submit", e => {
			e.preventDefault()
			
			login()
		}
	)
}

bind()
