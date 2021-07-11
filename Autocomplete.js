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
				? await this.getResults(query, this.options.data)
				: await this.getResultsAPI(query, this.options.githubAPI);

		results = results.slice(0, this.options.numOfResults);
		this.updateDropdown(results);
	}

	async getResults(query, data) {
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

	// additional methods added as per the refactor
	async makeAPICall(query) {
		let githubAPI = `${this.options.githubAPI}q=${query}&per_page=${this.numOfResults}`;
		// console.log('api', githubAPI);
		let res = await fetch(githubAPI);
		let results = await res.json();
		// add a new key called text to format to align with the elements in the states data array...
		results = results.items.map((item) => ({
			...item,
			text: item.login,
			value: item.login,
		}));
		return results;
	}

	async getResultsAPI(query, url) {
		if (!query) return [];

		let results = await this.makeAPICall(query);

		return results;
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
		let liSelected;
		let next;
		let index = -1;
		document
			.querySelector(`.${this.options.className}`)
			.addEventListener('keydown', (event) => {
				let lis = document.querySelectorAll(`.${this.options.className} .result`);
				let len = lis.length - 1;
				// keypress down arrow
				if (event.key === 'ArrowDown') {
					index += 1;
					//down
					// if an element has already been selected
					if (liSelected) {
						liSelected.classList.remove('selected');
						next = lis[index];
						console.log('next', next);
						if (next !== undefined && index <= len) {
							liSelected = next;
						} else {
							index = 0;
							liSelected = lis[0];
						}
						liSelected.classList.add('selected');
						console.log(index);
						// if no li has been selected
					} else {
						// start with the first li in the list
						index = 0;
						liSelected = lis[0];
						liSelected.classList.add('selected');
					}
				// keypress up arrow
				} else if (event.key === 'ArrowUp') {
					if (liSelected) {
						liSelected.classList.remove('selected');
						index -= 1;
						next = lis[index]
						console.log(index,next)
						if (next !== undefined && index >= 0) {
							liSelected = next;
						} else {
							index = len;
							liSelected = lis[len]
						}
						liSelected.classList.add('selected');
					} else {
						index = 0;
						liSelected = lis[len]
						liSelected.classList.add('selected');
					}
				} else if (event.key === 'Enter') {
					let item = lis[index];

					let itemVal = item.innerHTML
					console.log('itemVal', itemVal);
					let input = document.querySelector(
						`.${this.options.className} input`
					)
					input.value = itemVal
					this.createUserSelectionEl({ text: item.innerText });
				}
			});
	}
}

export default Autocomplete;
