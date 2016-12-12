'use strict';

describe('getLocalStorageItem', function() {
  it('returns a local storage item', function() {
    // Mocking window because Safari throws an error when setting a local storage item in Private
    // Browser Mode.
    var mockWindow = {
      localStorage: {
        setItem: function(key, value) {
          this[key] = value;
        },
        getItem: function(key) {
          return this[key];
        },
        removeItem: function(key) {
          this[key] = null;
        }
      }
    };

    var getLocalStorageItem = require('inject!../getLocalStorageItem')({
      window: mockWindow
    });

    mockWindow.localStorage.setItem('foo', 'something');
    expect(getLocalStorageItem('foo')).toEqual('something');

    mockWindow.localStorage.removeItem('foo');
    expect(getLocalStorageItem('foo')).toBeNull();
  });

  it('proper error handling if Local Storage is disabled', function() {
    var mockWindow = {
      localStorage: {
        getItem: function() {
          throw Error('Test error');
        }
      }
    };

    var getLocalStorageItem = require('inject!../getLocalStorageItem')({
      window: mockWindow
    });

    expect(getLocalStorageItem('foo')).toBeNull();
  });
});
