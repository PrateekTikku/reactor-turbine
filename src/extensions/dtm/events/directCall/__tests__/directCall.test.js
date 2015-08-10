'use strict';

describe('directCall event type', function() {
  var publicRequire = require('../../../../../engine/publicRequire');
  var delegateInjector = require('inject!../directCall');
  var delegate = delegateInjector({
    logger: publicRequire('logger')
  });

  it('triggers rule when _satellite.track() is called with matching name', function() {
    var trigger = jasmine.createSpy();

    delegate({
      eventConfig: {
        name: 'foo'
      }
    }, trigger);

    expect(trigger.calls.count()).toBe(0);

    _satellite.track('foo');

    expect(trigger.calls.count()).toBe(1);

    _satellite.track('bar');

    expect(trigger.calls.count()).toBe(1);
  });
});
