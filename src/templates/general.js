function logoutBind() {
 	const logout = document.getElementById("logout")
	logout.addEventListener("click", () => {
			fetch("/api/logout").then(() => {
					window.location.href = "/login"
				}
			)
		}
	)

	const mainPage = document.getElementById("mainPage")
	mainPage.addEventListener("click", () => {
			window.location.href = "/"
		}
	)
}

logoutBind()
