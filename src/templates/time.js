class timeSelector extends HTMLElement {
	constructor() {
		super()

		this.hour = 12
		this.minute = 0
	}

	updateDisplay() {
		this.querySelector("#hour").textContent = String(this.hour).padStart(2, "0")
		this.querySelector("#minute").textContent = String(this.minute).padStart(2, "0")
	}

	connectedCallback() {
		this.innerHTML = `
			<button id = "prevHour"> </button>
			<button id = "prevMinute"> </button>

			<div id = "hour"> </div>
			<div id = "minute"> </div>

			<button id = "nextHour"> </button>
			<button id = "nextMinute"> </button>
		`

		this.updateDisplay()

		this.querySelector("#prevHour").addEventListener("click", () => {
				this.hour = (this.hour + 23) % 24
				
				this.updateDisplay()
			}
		)
		this.querySelector("#nextHour").addEventListener("click", () => {
				this.hour = (this.hour + 1) % 24
				
				this.updateDisplay()
			}
		)
		this.querySelector("#prevMinute").addEventListener("click", () => {
				this.minute= (this.minute + 59) % 60
				
				this.updateDisplay()

			}
		)
		this.querySelector("#nextMinute").addEventListener("click", () => {
				this.minute = (this.minute + 1) % 60
				
				this.updateDisplay()
			}
		)
	}

	getValue() {
		return `${String(this.hour).padStart(2, "0")}:${String(this.minute).padStart(2, "0")}`
	}
}

customElements.define("time-selector", timeSelector)
