function optionsBind() {
	const formOptions = [
		{id: "optionsCalendar", path: "/calendar"}
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
