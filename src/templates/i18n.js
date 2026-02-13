function loadLanguage() {
  	const lang = document.documentElement.lang

  	fetch(`/templates/${lang}.json`).then(res => res.json()).then(data => {
      		const page = document.body.dataset.page
      		const pageData = data[page] || {}

      		document.querySelectorAll('[id]').forEach(el => {
        			const key = el.getAttribute('id')

        			if (el.tagName === 'INPUT' && (pageData[key + "Placeholder"] ?? data[key + "Placeholder"])) {
            			el.placeholder = pageData[key + "Placeholder"] ?? data[key + "Placeholder"]
          			}else if (pageData[key] ?? data[key]) {
            			el.textContent = pageData[key] ?? data[key]
          			}
        		}
			)
		}
	).catch(err => {
        	console.error("i18n error:", err)
    	}
	)
}

document.addEventListener('DOMContentLoaded', loadLanguage)
