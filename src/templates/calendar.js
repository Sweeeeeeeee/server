function numberDays(date) {
	return new Date(date.year, date.month, 0).getDate()
}

async function loadPlans(dateYM) {
	const dateString = `${date.year}-${String(date.month).padStart(2, '0')}`
	const res = await fetch(`/api/plans?date=${dateString}`)

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

	html.monthDisplay.textContent = date.month

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

	html.dayName.textContent = date.day

	html.week.innerHTML = ""
	html.days.innerHTML = ""
	html.dayPlan.innerHTML = ""

	for (let i = 0; i < 7; i++) {
		const weekDay = document.createElement("div")
		weekDay.id = "calendarWeek" + i
		
		html.week.appendChild(weekDay)
	}

	const plans = await loadPlans({year: date.year, month: date.month})

	const num = numberDays(date)
	for (let i = 1; i <= num; ) {
		for (let j = 0; j < 7 && i <= num; j++) {
			const day = document.createElement("div")
			day.className = "calendarDayCell"

			if (date.day == i) {
				day.setAttribute("special", "calendarSelectedDay")
			}

			let planCount = 0

			if (plans[i]) {
				planCount = plans[i].length
			}

			day.innerHTML = `<div class = "calendarDay"> ${i} </div>\n<div class = "calendarPlanCount"> ${planCount} </div>`

			html.days.appendChild(day)

			++i
		}
	}

	if (plans[date.day]) {
		plans[date.day].forEach((p, index) => {
				const item = document.createElement("div")
				item.innerHTML = `${p.text} <button id = "removePlan${index}"> </button>`
				html.dayPlan.appendChild(item)
			}
		)
	}
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
		dayPlan: document.querySelector(".planList"),

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
