import Autocomplete from './Autocomplete';
import states from './states';
import './main.css';


// US States
const data = states.map(state => ({
  text: state.name,
  value: state.abbreviation
}));

// GITHUB Users
const githubAPI = "http://api.github.com/search/users?"
// const githubAPI = "http://api.github.com/search/users?q={query}&per_page={numOfResults}"

https: new Autocomplete(document.getElementById('state'), {
	data,
  className: 'state-group',
  source: 'local',
	onSelect: (stateCode) => {
		console.log('selected state:', stateCode);
	},
});


// Github Users

new Autocomplete(document.getElementById('gh-user'), {
  githubAPI,
  className: 'gh-users-group',
  source: 'API',
  onSelect: (ghUserId) => {
    console.log('selected github user id:', ghUserId);
  },
});
