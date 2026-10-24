function optionsBind() {
	const formOptions = [
		{id: "optionCalendar", path: "/calendar"},
		{id: "todo", path: "/todo"},
		{id: "optionKe", path: "/ke"}
	]

	formOptions.forEach(option => {
			const element = document.getElementById(option.id)
			if (!element) {
				return
			}

			element.addEventListener("click", () => {
					window.location.href = option.path
				}
			)
		}
	)
}

document.addEventListener("DOMContentLoaded", () => {
		optionsBind()
	}
)
