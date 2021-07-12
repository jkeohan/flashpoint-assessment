import expect from 'expect';
import jsdom from 'jsdom-global';
import Autocomplete from '../Autocomplete';
import html from '../index.html';

let wrapper;

describe('Autocomplete', () => {
  before(() => {
    document.body.innerHTML = html;
    wrapper = new Autocomplete(document.getElementById('state'));
  });

  describe('States', () => {
    it('should initialize', () => {
      const input = document.querySelector('input');
      const results = document.querySelector('ul');

      expect(input).toBeTruthy();
      expect(input.type).toEqual('search');
      expect(input.name).toEqual('query');
      expect(results.className).toEqual('results');
    });

    it('should handle keyboard input', () => {
      const input = document.querySelector('#state input');
      input.value = "new york"
      document.body.dispatchEvent(new Event('keydown', {'key': 'ArrowDown'}));
      const lis = document.querySelector('#state li');
      expect(lis[0].className).toEqual('selected');
    });

    it('should populate input on value selection', () => {
      expect(false).toBeTruthy();
    })
  });

  describe('Github Profiles', () => {
    before(() => {
      document.body.innerHTML = html;
      wrapper = new Autocomplete(document.getElementById('state'));
    });

    it('should fetch github user(s) on text input', () => {
      expect(false).toBeTruthy();
    });

    it('should handle no results found', () => {
      expect(false).toBeTruthy();
    });

    it('should display user profile', () => {
      expect(false).toBeTruthy();
    })
  })
});
