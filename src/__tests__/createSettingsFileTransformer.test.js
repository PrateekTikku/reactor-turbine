/***************************************************************************************
 * (c) 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var createSettingsFileTransformer = require('../createSettingsFileTransformer');
var createDynamicHostResolver = require('../createDynamicHostResolver');

var turbineEmbedCode = 'https://assets.adobedtm.com';
var dynamicCdnEnabled = true;
var cdnAllowList = ['assets.adobedtm.com'];

var isDynamicEnforced;
var dynamicHostResolver;
var settingsFileTransformer;
var moduleReferencePath;

beforeAll(function () {
  var debugController = jasmine.createSpyObj('debugController', [
    'onDebugChanged'
  ]);
  dynamicHostResolver = createDynamicHostResolver(
    turbineEmbedCode,
    dynamicCdnEnabled,
    cdnAllowList,
    debugController
  );
});

beforeEach(function () {
  moduleReferencePath = 'someModule/folder/lib.js';
});

describe('isDynamicEnforced=false', function () {
  beforeAll(function () {
    isDynamicEnforced = false;
    settingsFileTransformer = createSettingsFileTransformer(
      isDynamicEnforced,
      dynamicHostResolver.decorateWithDynamicHost
    );
  });

  describe('basic input/output', function () {
    it('handles undefined', function () {
      expect(settingsFileTransformer(undefined, undefined, undefined)).toBe(
        undefined
      );
    });

    it('handles null', function () {
      expect(settingsFileTransformer(null, null, null)).toBe(null);
    });

    it('reflects back out a settings object untouched', function () {
      var oldSettings = {
        key1: 'foo',
        key2: [
          {
            someUrl: '/some/relative/url'
          }
        ],
        someUrl: '/some/relativeUrl'
      };

      var newSettings = settingsFileTransformer(oldSettings, [
        'someUrl',
        'key2[].someUrl'
      ]);

      expect(oldSettings).toEqual(newSettings);
      expect(oldSettings === newSettings).toBeTrue();
    });
  });
});

describe('isDynamicEnforced=true', function () {
  beforeAll(function () {
    isDynamicEnforced = true;
    settingsFileTransformer = createSettingsFileTransformer(
      isDynamicEnforced,
      dynamicHostResolver.decorateWithDynamicHost
    );
  });

  describe('basic input/output', function () {
    it('handles undefined', function () {
      expect(settingsFileTransformer(undefined, undefined, undefined)).toBe(
        undefined
      );
    });

    it('handles null', function () {
      expect(settingsFileTransformer(null, null, null)).toBe(null);
    });
  });

  it('can update a settings object containing one value', function () {
    var oldSettings = {
      source: '/some/relative/url'
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['source'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      source: 'https://assets.adobedtm.com/some/relative/url'
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('can update a top level setting (array)', function () {
    var oldSettings = {
      sources: [
        {
          someUrl: '/some/relative/url',
          someOtherKey: 'foo'
        },
        {
          someOtherKey: 'foo'
        },
        {
          someUrl: '/some/relative/url',
          someOtherKey: 'foo'
        }
      ]
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['sources[].someUrl'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      sources: [
        {
          someUrl: 'https://assets.adobedtm.com/some/relative/url',
          someOtherKey: 'foo'
        },
        {
          someOtherKey: 'foo'
        },
        {
          someUrl: 'https://assets.adobedtm.com/some/relative/url',
          someOtherKey: 'foo'
        }
      ]
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('can update a top level setting (object)', function () {
    var oldSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world'
        },
        nestedList: ['0', '1', '2']
      },
      someList: ['a', 'b', 'c'],
      topValue: '/some/relative/url'
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['topValue'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world'
        },
        nestedList: ['0', '1', '2']
      },
      someList: ['a', 'b', 'c'],
      topValue: 'https://assets.adobedtm.com/some/relative/url'
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('can update a nested object', function () {
    var oldSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world',
          someUrl: '/some/relative/url'
        },
        nestedList: [{}, {}, {}]
      },
      someList: [
        {
          someUrl: '/some/relative/url'
        }
      ]
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['a.b.someUrl'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world',
          someUrl: 'https://assets.adobedtm.com/some/relative/url'
        },
        nestedList: [{}, {}, {}]
      },
      someList: [
        {
          someUrl: '/some/relative/url'
        }
      ]
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('can update a nested object', function () {
    var oldSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world',
          someUrl: '/some/relative/url'
        },
        nestedList: [{}, {}, {}]
      },
      someList: [
        {
          someUrl: '/some/relative/url'
        }
      ]
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['a.b.someUrl'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      a: {
        b: {
          value: 'foo',
          secondValue: 'world',
          someUrl: 'https://assets.adobedtm.com/some/relative/url'
        },
        nestedList: [{}, {}, {}]
      },
      someList: [
        {
          someUrl: '/some/relative/url'
        }
      ]
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('does not unexpectedly transform a setting too early', function () {
    var oldSettings = {
      a: {
        someUrl: {
          value: 'foo',
          secondValue: 'world',
          nestedList: [
            {
              someUrl: '/some/relative/url',
              someOtherKey: 'foo'
            },
            {
              someOtherKey: 'foo'
            },
            {
              someUrl: '/some/relative/url',
              someOtherKey: 'foo'
            }
          ]
        }
      }
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['a.someUrl.nestedList[].someUrl'],
      moduleReferencePath
    );

    var expectedNewSettings = {
      a: {
        someUrl: {
          value: 'foo',
          secondValue: 'world',
          nestedList: [
            {
              someUrl: 'https://assets.adobedtm.com/some/relative/url',
              someOtherKey: 'foo'
            },
            {
              someOtherKey: 'foo'
            },
            {
              someUrl: 'https://assets.adobedtm.com/some/relative/url',
              someOtherKey: 'foo'
            }
          ]
        }
      }
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  it('transforms many file paths', function () {
    var oldSettings = {
      a: {
        someUrl: {
          value: 'foo',
          secondValue: 'world',
          nestedList: [
            {
              someUrl: '/some/relative/url',
              someOtherKey: 'foo'
            },
            {
              someOtherKey: 'foo'
            },
            {
              someUrl: '/some/relative/url',
              someOtherKey: 'foo'
            }
          ]
        },
        someOtherUrl: '/some/relative/url'
      },
      b: {
        someUrl: '/some/relative/url'
      },
      c: [
        {
          aKey: 'foo'
        },
        {
          aKey: 'foo',
          aList: [
            {
              aKey: 'foo',
              someUrl: '/some/relative/url'
            }
          ],
          someOtherUrl: '/some/relative/url'
        }
      ]
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      [
        'a.someUrl.nestedList[].someUrl',
        'a.someOtherUrl',
        'b.someUrl',
        'c[].someOtherUrl',
        'c[].aList[].someUrl'
      ],
      moduleReferencePath
    );

    var expectedNewSettings = {
      a: {
        someUrl: {
          value: 'foo',
          secondValue: 'world',
          nestedList: [
            {
              someUrl: 'https://assets.adobedtm.com/some/relative/url',
              someOtherKey: 'foo'
            },
            {
              someOtherKey: 'foo'
            },
            {
              someUrl: 'https://assets.adobedtm.com/some/relative/url',
              someOtherKey: 'foo'
            }
          ]
        },
        someOtherUrl: 'https://assets.adobedtm.com/some/relative/url'
      },
      b: {
        someUrl: 'https://assets.adobedtm.com/some/relative/url'
      },
      c: [
        {
          aKey: 'foo'
        },
        {
          aKey: 'foo',
          aList: [
            {
              aKey: 'foo',
              someUrl: 'https://assets.adobedtm.com/some/relative/url'
            }
          ],
          someOtherUrl: 'https://assets.adobedtm.com/some/relative/url'
        }
      ]
    };

    expect(newSettings).toEqual(expectedNewSettings);
  });

  describe('leaves values alone that are not strings', function () {
    it('number check', function () {
      var oldSettings = {
        someKey: 5
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['someKey'],
        moduleReferencePath
      );

      expect(oldSettings).toEqual(newSettings);
    });

    it('boolean check', function () {
      var oldSettings = {
        someKey: true
      };

      var newSettings = settingsFileTransformer(oldSettings, ['someKey']);

      expect(oldSettings).toEqual(newSettings);
    });

    it('object check', function () {
      var oldSettings = {
        someKey: { isAnObject: true }
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['someKey'],
        moduleReferencePath
      );

      expect(oldSettings).toEqual(newSettings);
    });

    it('array check', function () {
      var oldSettings = {
        someKey: ['is', 'a', 'list']
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['someKey'],
        moduleReferencePath
      );

      expect(oldSettings).toEqual(newSettings);
    });
  });

  it('it can handle bad paths', function () {
    var oldSettings = {
      someKey: { isAnObject: true },
      someOtherKey: '/some/relative/url'
    };

    var newSettings = settingsFileTransformer(
      oldSettings,
      ['this.key[].doesNotExist'],
      moduleReferencePath
    );

    expect(oldSettings).toEqual(newSettings);
  });

  describe('handles the Adobe Custom Code action correctly', function () {
    beforeEach(function () {
      moduleReferencePath = 'core/src/lib/actions/customCode.js';
    });

    it('does not transform when isExternal is not present', function () {
      var oldSettings = {
        source: '/some/relative/url',
        isExternal: undefined
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['source'],
        moduleReferencePath
      );

      expect(oldSettings).toEqual(newSettings);
    });

    it('does not transform when isExternal=false', function () {
      var oldSettings = {
        source: '/some/relative/url',
        isExternal: false
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['source'],
        moduleReferencePath
      );

      expect(oldSettings).toEqual(newSettings);
    });

    it('transforms when isExternal=true', function () {
      var oldSettings = {
        source: '/some/relative/url',
        isExternal: true
      };

      var newSettings = settingsFileTransformer(
        oldSettings,
        ['source'],
        moduleReferencePath
      );

      var expectedNewSettings = {
        source: 'https://assets.adobedtm.com/some/relative/url',
        isExternal: true
      };

      expect(newSettings).toEqual(expectedNewSettings);
    });
  });
});
