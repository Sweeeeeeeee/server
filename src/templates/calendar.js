function numberDays(date) {
	return new Date(date.year, date.month, 0).getDate()
}

async function loadPlans(dateYM) {
	const date = `${dateYM.year}-${String(dateYM.month).padStart(2, '0')}`
	const res = await fetch(`/api/plans?date=${date}`)

	if (!res.ok) {
		console.log(1)
		throw new Error(await res.text())
	}

	return await res.json()
}

async function renderYear(html, date) {
	html.yearDisplay.textContent = date.year

	await renderMonth(html, date)
}

async function renderMonth(html, date) {
	if (date.month == 0) {
		date.month = 12
		date.year -= 1

		await renderYear(html, date)
		return
	}else if (date.month == 13) {
		date.month = 1
		date.year += 1

		await renderYear(html, date)
		return
	}

	const num = numberDays(date)
	if (date.day > num) {
		date.day = num
	}

	html.monthDisplay.innerHTML = date.month

	// const monthDiv = document.createElement("div")
	// monthDiv.id = `month${date.month}`
	// html.monthDisplay.appendChild(monthDiv)

	await renderDays(html, date)
}

async function renderDays(html, date) {
	if (date.day == 0) { 
		date.day = 31
		date.month -= 1

		await renderMonth(html, date)
		return
	}else if (date.day > numberDays(date)) {
		date.day = 1
		date.month += 1

		await renderMonth(html, date)
		return
	}

	const fragmentWeek = document.createDocumentFragment()
	const fragmentDays = document.createDocumentFragment()
	const fragmentDayPlan = document.createDocumentFragment()

	const weekRow = document.createElement("div")

	for (let i = 0; i < 7; i++) {
		const weekDay = document.createElement("div")
		weekDay.id = "week" + i
		
		weekRow.appendChild(weekDay)
	}
	fragmentWeek.appendChild(weekRow)

	const plans = await loadPlans({year: date.year, month: date.month})

	const todayFull = new Date()
	let today = todayFull.getDate()
	if ((todayFull.getFullYear() != date.year) || (todayFull.getMonth() != date.month - 1)) {
		today = -1
	}

	const num = numberDays(date)
	for (let i = 1; i <= num; ) {
		const daysRow = document.createElement("div")
		for (let j = 0; j < 7 && i <= num; j++) {
			const day = document.createElement("div")
			day.className = "dayCell"

			const dayNumber = i
			day.addEventListener("click", () => {
					date.day = dayNumber
					
					renderDays(html, date)
				}
			)

			if (date.day == i) {
				day.classList.add("selectedDay")
			}
			if (today == i) {
				day.classList.add("today")
			}

			let planCount = 0
			if (plans[i]) {
				planCount = plans[i].length
			}

			day.innerHTML = `<div class = "calendarDay"> ${i} </div>\n<div class = "planCount"> ${planCount} </div>`

			daysRow.appendChild(day)

			i++
		}

		fragmentDays.appendChild(daysRow)
	}

	if (plans[date.day]) {
		plans[date.day].forEach((p, index) => {
				const item = document.createElement("div")
				console.log(p.timeFrom, p.timeTo)
				item.innerHTML = `${p.text} <button id = "removePlan${index}"> </button> ${p.timeFrom} - ${p.timeTo}`
				
				const del = item.querySelector(`#removePlan${index}`)
				del.addEventListener("click", async () => {
						await fetch(`/api/plans/delete?id=${p.id}`, {method: "DELETE"})

						await renderDays(html, date)
					}
				)

				fragmentDayPlan.appendChild(item)
			}
		)
	}

	html.week.innerHTML = ""
	html.days.innerHTML = ""
	html.dayPlan.innerHTML = ""

	html.dayName.textContent = date.day

	html.week.appendChild(fragmentWeek)
	html.days.appendChild(fragmentDays)
	html.dayPlan.appendChild(fragmentDayPlan)
}

async function renderCalendar() {
	const html = {
		yearPrev: document.getElementById("prevYear"),
		yearNext: document.getElementById("nextYear"),
		yearDisplay: document.getElementById("year"),
	
		monthPrev: document.getElementById("prevMonth"),
		monthNext: document.getElementById("nextMonth"),
		monthDisplay: document.getElementById("month"),

		week: document.querySelector(".week"),
		days: document.querySelector(".days"),
	
		dayPrev: document.getElementById("prevDay"),
		dayNext: document.getElementById("nextDay"),
		dayName: document.getElementById("dayName"),
		dayPlan: document.querySelector(".dayPlans"),

		dayAddPlan: document.getElementById("addDayPlan"),
		newPlan: document.getElementById("newPlan"),
		timeFrom: document.getElementById("timeFrom"),
		timeTo: document.getElementById("timeTo")
	}

	const today = new Date()

	let date = {year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate()}

	await renderYear(html, date)

	html.yearPrev.addEventListener("click", () => {
			date.year -= 1

			renderYear(html, date)
		}
	)
	html.yearNext.addEventListener("click", () => {
			date.year += 1

			renderYear(html, date)
		}
	)
	html.monthPrev.addEventListener("click", () => {
			date.month -= 1

			renderMonth(html, date)
		}
	)
	html.monthNext.addEventListener("click", () => {
			date.month += 1

			renderMonth(html, date)
		}
	)
	html.dayPrev.addEventListener("click", () => {
			date.day -= 1

			renderDays(html, date)
		}
	)
	html.dayNext.addEventListener("click", () => {
			date.day += 1

			renderDays(html, date)
		}
	)
	html.dayAddPlan.addEventListener("click", async () => {
			const newPlanText = html.newPlan.value.trim()
    		if (!newPlanText) {
				return
			}

    		const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`

    		await fetch("/api/plans/add", {
        			method: "POST",
        			headers: {"Content-Type": "application/json"},
        			body: JSON.stringify({
							date: dateStr, 
							text: newPlanText,
							timeFrom: html.timeFrom.getValue(),
							timeTo: html.timeTo.getValue()
						}
					)
    			}
			)

    		html.newPlan.value = ""

			await renderDays(html, date)
		}
	)
}

document.addEventListener("DOMContentLoaded", renderCalendar)
