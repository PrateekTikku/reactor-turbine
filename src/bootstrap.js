/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var state = require('./state');

require('./hydrateSatelliteObject')(
  window._satellite.container.buildInfo,
  state.setDebugOutputEnabled
);

state.init(window._satellite.container); // Must come first.
delete window._satellite.container;
require('./logger').outputEnabled = state.getDebugOutputEnabled();
require('./initRules')(); // Must come last.
