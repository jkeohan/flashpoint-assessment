# Solution Docs

<!-- You can include documentation, additional setup instructions, notes etc. here -->

## Errors, Issues and Resolutions

Initially I encountered the following errors during development: 

- version of node (15.5.1) not compatible with fsevents@1.2.13:
- async/await not supported in webpack

**ISSUE**: Initial issues with running yarn install...for some reason it didn't work so I opted for npm install...that also didn't work <br>
**ERROR**: related to fsevents module...

```bash
warning Error running install script for optional dependency: "/Users/joekeohan/Desktop/seir/assessments/swe-ui-code-test-master/node_modules/fsevents: Command failed.
Exit code: 1v <br>
```

**RESOLUTION**: Downgraded node on my machine from 15.5.1 to v13.1.0 using:

```
nvm use v13.1.0
```

I chose v13 as it was the next previous version installed on my mac.

The install worked and then I saw the following message which might explain why it didn't work on v15

```
npm WARN deprecated fsevents@1.2.13:
  fsevents 1 will break on node v14+ and could be using insecure binaries.
  Upgrade to fsevents 2.
```

<hr>

**ISSUE**: webpack not configured to support async/await<br>
**ERROR**: The error was as follows:
**RESOLUTION**: added the following polyfill to **webpack.config.js**

```js
// previous config
  entry: {
    bundle: './index.js'
  },

```git push -u origin main

```js
// updated config
entry: {
  bundle: ["@babel/polyfill",'./index.js']
},
```

## Solution

### Task #1: Enhance the component so that it also accepts an HTTP endpoint as a data source.

In order to refactor the component to accept a url the following actions were taken:

- pass additional options when initializing the component
- update onQueryChange function to display the results based on data vs github
-

#### Pass additional options when initializing the component

New options were passed during it's instantiation. These additional values changed depending on which component was being initiated.

For the **state** component the following keys were added:

- className: 'state-group',
- source: 'local',

```js
https: new Autocomplete(document.getElementById('state'), {
	data,
	className: 'state-group',
	source: 'local',
	onSelect: (stateCode) => {
		console.log('selected state:', stateCode);
	},
});
```

For the **gh-users** component the following keys were added:

- githubAPI,
- className: 'gh-users-group',
- source: 'API',

```js
new Autocomplete(document.getElementById('gh-user'), {
	githubAPI,
	className: 'gh-users-group',
	source: 'API',
	onSelect: (ghUserId) => {
		console.log('selected github user id:', ghUserId);
	},
});
```

#### Update onQueryChange function to display the results based on data vs github

The **onQueryChange** method was updated to include logic that would called either **getResults** or a newly added function **getResultsAPI** based on the value of **this.options.source**

```js
async onQueryChange(query) {
  let results =
    this.options.source === 'local'
      ? await this.getResults(query, this.options.data)
      : await this.getResultsAPI(query, this.options.githubAPI);

  // more code...
	}
```

### Task #2: When an item in the dropdown is selected by mouse click or by hitting the Enter key, show the selected item below the search input(s).

```js
el.addEventListener('click', (event) => {
	const { onSelect } = this.options;
	if (typeof onSelect === 'function') onSelect(result.value);
	// added the folowing
	this.createUserSelectionEl(result);
});
```

#### getResultsAPI

The following functions were added to make the API call:

- **makeAPICall** 
- **getResultsAPI** 

##### **makeAPICall** 

The **makeAPICall** function was added to make the API call.  This function was called by **getResultsAPI**

```js
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
```


The function was also configured to standardize the results to align with how the component was already configured to render the li's. 
)

```js
results = results.items.map((item) => ({
	...item,
	text: item.login,
	value: item.login,
}));
```

##### **getResultsAPI**

The **getResultsAPI** was created to emulate the functionality of **getResults** and it calls **makeAPICall**.  

```js
async getResultsAPI(query, url) {
	if (!query) return [];

	let results = await this.makeAPICall(query);

	return results;
}
```

Both functions were configured to use **async/await** and required that the **webpack.config.js** file be updated (included in solution section

The function was also configured to standardize the results to align with how the component was already configured to render the li's. 
)


#### Task #3: When an item in the dropdown is selected by mouse click or by hitting the Enter key, show the selected item below the search input(s).

Enabling this functionality required the following methods:

- **addKeyPressEventListener**
- **createUserSelectionEl**
- **removeUserSelectionEl**

##### **addKeyPressEventListener**

This method adds and listens for **ArrowDown**, **ArrowUp** and **Enter** events.  

In order to keep the events targeted for their respective component the querySelector targeted the className passed in as an option. 

```js
document.querySelector(`.${this.options.className}`)
```

```js
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
```

##### 	createUserSelectionEl

This method handles the creation of a new div below the ul that displays the user selected choice. 

```js
createUserSelectionEl(item) {
	console.log('item', item);
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
```

##### 	removeUserSelectionEl

This method handles the removal any previous div of the user selected choice.

```js
removeUserSelectionEl() {
	let el = document.querySelector(
		`.${this.options.className} .user-selection`
	);
	console.log('el', el);
	if (el) {
		el.remove();
	}
}
```