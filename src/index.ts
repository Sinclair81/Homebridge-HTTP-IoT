  
import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  HAP,
  Logging,
  Service
} from "homebridge";

const axios = require('axios').default;
const pjson = require('../package.json');

import { md5 } from "./md5";

import { SwitchAccessory }    from "./accessories/SwitchAccessory"
import { LightbulbAccessory } from "./accessories/LightbulbAccessory"
import { OutletAccessory }    from "./accessories/OutletAccessory"

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("HTTP-IoT", HttpIotAccessory);
};

class HttpIotAccessory implements AccessoryPlugin {

  serviceToExpose: any;
  informationService: Service;

  private readonly log:    Logging;
  private readonly name:   string;
  private readonly config: AccessoryConfig;
  private readonly api:    API;

  private accStates = {
    On:               false, // bool
    Brightness:       0,     // number 0% - 100%
    ColorTemperature: 140,   // number 140 - 500
    Hue:              0,     // number 0° - 360°
    Saturation:       0,     // number 0% - 100%
  };

  lightbulbAccessory: LightbulbAccessory;
  switchAccessory:    SwitchAccessory;
  outletAccessory:    OutletAccessory;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log    = log;
    this.name   = config.name;
    this.config = config;
    this.api    = api;

    this.lightbulbAccessory = new LightbulbAccessory(this.log, this.config, this.accStates, this.api);
    this.switchAccessory    = new SwitchAccessory(this.log, this.config, this.accStates, this.api);
    this.outletAccessory    = new OutletAccessory(this.log, this.config, this.accStates, this.api);

    if ((!this.config.type) || (this.config.type == "lightbulb")) {

      let lightbulbService: Service = new hap.Service.Lightbulb(this.name);

      this.lightbulbAccessory.lightbulbErrorCheck();

      if (this.lightbulbAccessory.lightbulbCheckOnOff()) {
        lightbulbService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.lightbulbAccessory.lightbulbUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbAccessory.lightbulbSetOn(value);
            callback();
          });
      }

      if (this.lightbulbAccessory.lightbulbCheckBrightness()) {
        lightbulbService.getCharacteristic(hap.Characteristic.Brightness)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.Brightness);
            this.lightbulbAccessory.lightbulbUpdateBrightness();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbAccessory.lightbulbSetBrightness(value);
            callback();
          });
      }

      if (this.lightbulbAccessory.lightbulbCheckHue()) {
        lightbulbService.getCharacteristic(hap.Characteristic.Hue)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.Hue);
            this.lightbulbAccessory.lightbulbUpdateHue();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbAccessory.lightbulbSetHue(value);
            callback();
          });
      }

      if (this.lightbulbAccessory.lightbulbCheckColorTemperature()) {
        lightbulbService.getCharacteristic(hap.Characteristic.ColorTemperature)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.ColorTemperature);
            this.lightbulbAccessory.lightbulbUpdateColorTemperature();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbAccessory.lightbulbSetColorTemperature(value);
            callback();
          });
      }

      this.serviceToExpose                     = lightbulbService;
      this.lightbulbAccessory.lightbulbService = lightbulbService 

    }

    if (this.config.type == "switch") {

      let switchService: Service = new hap.Service.Switch(this.name);

      this.switchAccessory.switchErrorCheck();

      if (this.switchAccessory.switchCheckOnOff()) {
        switchService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.switchAccessory.switchUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.switchAccessory.switchSetOn(value);
            callback();
          });
      }

      this.serviceToExpose               = switchService;
      this.switchAccessory.switchService = switchService 

    }

    if (this.config.type == "outlet") {

      let outletService: Service = new hap.Service.Outlet(this.name);

      this.outletAccessory.outletErrorCheck();

      if (this.outletAccessory.outletCheckOnOff()) {
        outletService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.outletAccessory.outletUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.outletAccessory.outletSetOn(value);
            callback();
          });
      }

      this.serviceToExpose               = outletService;
      this.outletAccessory.outletService = outletService 

    }

    this.informationService = new hap.Service.AccessoryInformation()
        .setCharacteristic(hap.Characteristic.Manufacturer,     pjson.author.name)
        .setCharacteristic(hap.Characteristic.Model,            pjson.model)
        .setCharacteristic(hap.Characteristic.FirmwareRevision, pjson.version)
        .setCharacteristic(hap.Characteristic.SerialNumber, md5(this.name + pjson.model));

  }

  identify(): void {
    this.log("HTTP IoT Identify!");
  }

  getServices(): Service[] {
    return [ this.informationService, this.serviceToExpose ];
  }

}

/*
Color Temperature:
https://developer.apple.com/documentation/homekit/hmcharacteristictypecolortemperature?language=objc
The corresponding value is an integer representing the color temperature in micro-reciprocal degrees (mired), 
which is 1,000,000 divided by the color temperature in kelvins. For example, to emulate a traditional tungsten 
light with a color temperature of 3200 K, use a mired value of about 312.
Homebridge Values: 140 - 500 mired.
*/

/*

axios({
    method: ,
    url: 
  })
    .then( (response: any) => {
      
    })
    .catch( (error: any) => {
      if (this.config.debugMsgLog) {
        this.log.info(error.message);
      }
    });

*/