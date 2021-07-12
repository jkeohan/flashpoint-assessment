class Autocomplete {
	constructor(rootEl, options = {}) {
		Object.assign(this, {
			rootEl,
			numOfResults: 10,
			data: [],
			options,
		});
		this.init();
	}

	init() {
		// Build query input
		this.inputEl = this.createQueryInputEl();
		this.rootEl.appendChild(this.inputEl);

		// Build results dropdown
		this.listEl = document.createElement('ul');
		Object.assign(this.listEl, { className: 'results' });
		this.rootEl.appendChild(this.listEl);

		this.addKeyPressEventListener();
	}

	createQueryInputEl() {
		const inputEl = document.createElement('input');
		Object.assign(inputEl, {
			type: 'search',
			name: 'query',
			autocomplete: 'off',
		});
		inputEl.addEventListener('input', (event) =>
			this.onQueryChange(event.target.value)
		);

		return inputEl;
	}

	createResultsEl(results) {
		const fragment = document.createDocumentFragment();
		console.log('results', results);
		results.forEach((result) => {
			const el = document.createElement('li');
			Object.assign(el, {
				className: 'result',
				textContent: result.text,
			});

			// Pass the value to the onSelect callback
			el.addEventListener('click', (event) => {
				const { onSelect } = this.options;
				if (typeof onSelect === 'function') onSelect(result.value);
				this.createUserSelectionEl(result);
			});

			fragment.appendChild(el);
		});
		return fragment;
	}

	async onQueryChange(query) {
		// Get data for the dropdown
		let results =
			this.options.source === 'local'
				? this.getResults(query, this.options.data)
				: await this.getResultsAPI(query, this.options.githubAPI);

		results = results.slice(0, this.options.numOfResults);
		this.updateDropdown(results);
	}

	getResults(query, data) {
		if (!query) return [];
		// Filter for matching strings
		let results = data.filter((item) => {
			return item.text.toLowerCase().includes(query.toLowerCase());
		});

		return results;
	}

	updateDropdown(results) {
		this.listEl.innerHTML = '';
		this.listEl.appendChild(this.createResultsEl(results));
	}

	getResultsAPI(query, url) {
		if (!query) return [];

		const results = this.makeAPICall(query);

		return results;
	}

	// additional methods added as per the refactor
	makeAPICall(query) {
		let githubAPI = `${this.options.githubAPI}q=${query}&per_page=${this.numOfResults}`;
		// console.log('api', githubAPI);
		const results = async () => {
			let res = await fetch(githubAPI);
			let json = await res.json();
			console.log('json', json)
			// add a new key called text to format to align with the elements in the states data array...
			json = json.items.map((item) => ({
				...item,
				text: item.login,
				value: item.login,
			}));
			return json;
		};

		return results();
	}

	// being called in createResultsEl(results)
	createUserSelectionEl(item) {
		// remove previous selected item
		this.removeUserSelectionEl();
		// create new element
		this.divEl = document.createElement('div');
		this.divEl.innerHTML = item.text;
		Object.assign(this.divEl, {
			className: `${this.options.className} user-selection`,
		});

		this.parentEl = document.querySelector(`.${this.options.className}`);
		this.parentEl.appendChild(this.divEl);
	}

	removeUserSelectionEl() {
		let el = document.querySelector(
			`.${this.options.className} .user-selection`
		);
		if (el) {
			el.remove();
		}
	}

	addKeyPressEventListener() {
		let currentLi;
		let nextLi;
		let index = -1;
		document
			.querySelector(`.${this.options.className}`)
			.addEventListener('keydown', (event) => {
				let lis = document.querySelectorAll(
					`.${this.options.className} .result`
				);
				let len = lis.length - 1;
				// keypress down arrow
				if (event.key === 'ArrowDown') {
					index += 1;
					//down
					// if an li has already been selected
					if (currentLi) {
						currentLi.classList.remove('selected');
						nextLi = lis[index];
						if (index <= len) {
							currentLi = nextLi;
						} else {
							index = 0;
							currentLi = lis[0];
						}
						currentLi.classList.add('selected');
						console.log(index);
						// if no li has been selected
					} else {
						// start with the first li in the list
						index = 0;
						currentLi = lis[0];
						currentLi.classList.add('selected');
					}
					// keypress up arrow
				} else if (event.key === 'ArrowUp') {
					if (currentLi) {
						currentLi.classList.remove('selected');
						index -= 1;
						nextLi = lis[index];
						if (index >= 0) {
							currentLi = nextLi;
						} else {
							index = len;
							currentLi = lis[len];
						}
						currentLi.classList.add('selected');
					} else {
						index = 0;
						currentLi = lis[len];
						currentLi.classList.add('selected');
					}
				} else if (event.key === 'Enter') {
					let item = lis[index];
					let itemVal = item.innerHTML;
					console.log('itemVal', itemVal);
					let input = document.querySelector(
						`.${this.options.className} input`
					);
					input.value = itemVal;
					this.createUserSelectionEl({ text: item.innerText });
				}
			});
	}
}

export default Autocomplete;
