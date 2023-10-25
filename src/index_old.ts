  
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

let hap: HAP;

export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("HTTP-IoT", HttpIotAccessory);
};

class HttpIotAccessory implements AccessoryPlugin {

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

  private readonly lightbulbService: Service;
  private readonly switchService: Service;
  private readonly outletService: Service;
  private readonly informationService: Service;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log    = log;
    this.name   = config.name;
    this.config = config;
    this.api    = api;

    this.lightbulbService = new hap.Service.Lightbulb(this.name);
    this.switchService    = new hap.Service.Switch(this.name);
    this.outletService    = new hap.Service.Outlet(this.name);

    if ((!this.config.type) || (this.config.type == "lightbulb")) {

      this.lightbulbErrorCheck();

      if (this.lightbulbCheckOnOff()) {
        this.lightbulbService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.lightbulbUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbSetOn(value);
            callback();
          });
      }

      if (this.lightbulbCheckBrightness()) {
        this.lightbulbService.getCharacteristic(hap.Characteristic.Brightness)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.Brightness);
            this.lightbulbUpdateBrightness();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbSetBrightness(value);
            callback();
          });
      }

      if (this.lightbulbCheckHue()) {
        this.lightbulbService.getCharacteristic(hap.Characteristic.Hue)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.Hue);
            this.lightbulbUpdateHue();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbSetHue(value);
            callback();
          });
      }

      if (this.lightbulbCheckColorTemperature()) {
        this.lightbulbService.getCharacteristic(hap.Characteristic.ColorTemperature)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.ColorTemperature);
            this.lightbulbUpdateColorTemperature();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.lightbulbSetColorTemperature(value);
            callback();
          });
      }

      if (this.config.updateIntervall) {
        setInterval(() => {
          if (this.lightbulbCheckOnOff()) {
            this.lightbulbUpdateOn();
          }
          if (this.lightbulbCheckBrightness()) {
            this.lightbulbUpdateBrightness();
          }
          if (this.lightbulbCheckHue()) {
            this.lightbulbUpdateHue();
          }
          if (this.lightbulbCheckColorTemperature()) {
            this.lightbulbUpdateColorTemperature();
          }
        }, this.config.updateIntervall);
      }

    }

    if (this.config.type == "switch") {

      this.switchErrorCheck();

      if (this.switchCheckOnOff()) {
        this.switchService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.switchUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.switchSetOn(value);
            callback();
          });
      }

      if (this.config.updateIntervall) {
        setInterval(() => {
          if (this.switchCheckOnOff()) {
            this.switchUpdateOn();
          }
        }, this.config.updateIntervall);
      }

    }

    if (this.config.type == "outlet") {

      this.outletErrorCheck();

      if (this.outletCheckOnOff()) {
        this.outletService.getCharacteristic(hap.Characteristic.On)
          .on(CharacteristicEventTypes.GET, async (callback: CharacteristicGetCallback) => {
            callback(undefined, this.accStates.On);
            this.outletUpdateOn();
          })
          .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
            this.outletSetOn(value);
            callback();
          });
      }

      if (this.config.updateIntervall) {
        setInterval(() => {
          if (this.outletCheckOnOff()) {
            this.outletUpdateOn();
          }
        }, this.config.updateIntervall);
      }

    }

    this.informationService = new hap.Service.AccessoryInformation()
        .setCharacteristic(hap.Characteristic.Manufacturer,     pjson.author.name)
        .setCharacteristic(hap.Characteristic.Model,            pjson.model)
        .setCharacteristic(hap.Characteristic.FirmwareRevision, pjson.version)
        .setCharacteristic(hap.Characteristic.SerialNumber, md5(this.name + pjson.model));

    // log.info("Lightbulb finished initializing!");
  }

  lightbulbErrorCheck() {
    if (this.config.lightbulbGetOn && this.config.lightbulbSetOn && this.config.lightbulbSetOff) {
      if (!this.config.lightbulbGetOn.url || !this.config.lightbulbGetOn.method || !this.config.lightbulbGetOn.pattern || 
        !this.config.lightbulbSetOn.url || !this.config.lightbulbSetOn.method || !this.config.lightbulbSetOff.url || !this.config.lightbulbSetOff.method) {
        this.log.error('Config is not correct!');
      }
    } else {
      this.log.error('Config is not correct!');
    }
  }
  lightbulbCheckOnOff(): boolean {
    let check = true;
    if (!this.config.lightbulbGetOn || !this.config.lightbulbSetOn || !this.config.lightbulbSetOff ) {
      check = false;
    }
    return check;
  }
  lightbulbCheckBrightness(): boolean {
    let check = true;
    if (!this.config.lightbulbGetBrightness || !this.config.lightbulbSetBrightness ) {
      check = false;
    }
    return check;
  }
  lightbulbCheckHue(): boolean {
    let check = true;
    if (!this.config.lightbulbGetHue || !this.config.lightbulbSetHue ) {
      check = false;
    }
    return check;
  }
  lightbulbCheckColorTemperature(): boolean {
    let check = true;
    if (!this.config.lightbulbGetColorTemperature || !this.config.lightbulbSetColorTemperature ) {
      check = false;
    }
    return check;
  }

  switchErrorCheck() {
    if (this.config.switchGetOn && this.config.switchSetOn && this.config.switchSetOff) {
      if (!this.config.switchGetOn.url || !this.config.switchGetOn.method || !this.config.switchGetOn.pattern || 
        !this.config.switchSetOn.url || !this.config.switchSetOn.method || !this.config.switchSetOff.url || !this.config.switchSetOff.method) {
        this.log.error('Config is not correct!');
      }
    } else {
      this.log.error('Config is not correct!');
    }
  }
  switchCheckOnOff(): boolean {
    let check = true;
    if (!this.config.switchGetOn || !this.config.switchSetOn || !this.config.switchSetOff ) {
      check = false;
    }
    return check;
  }

  outletErrorCheck() {
    if (this.config.outletGetOn && this.config.outletSetOn && this.config.outletSetOff) {
      if (!this.config.outletGetOn.url || !this.config.outletGetOn.method || !this.config.outletGetOn.pattern || 
        !this.config.outletSetOn.url || !this.config.outletSetOn.method || !this.config.outletSetOff.url || !this.config.outletSetOff.method) {
        this.log.error('Config is not correct!');
      }
    } else {
      this.log.error('Config is not correct!');
    }
  }
  outletCheckOnOff(): boolean {
    let check = true;
    if (!this.config.outletGetOn || !this.config.outletSetOn || !this.config.outletSetOff ) {
      check = false;
    }
    return check;
  }

  identify(): void {
    this.log("HTTP IoT Identify!");
  }

  getServices(): Service[] {
    if (this.config.type == "lightbulb") {
      return [ this.informationService, this.lightbulbService ];
    }
    if (this.config.type == "switch") {
      return [ this.informationService, this.switchService ];
    }
    if (this.config.type == "outlet") {
      return [ this.informationService, this.outletService ];
    }
    return [ this.informationService, this.lightbulbService ];
  }

  async lightbulbUpdateOn() {
    axios({
      method: this.config.lightbulbGetOn.method.toLowerCase(),
      url: this.config.lightbulbGetOn.url
    })
      .then( (response: any) => {
        // this.log(response.headers.content_type);
        let on = false;
        if (response.data.trim() == this.config.lightbulbGetOn.pattern) {
          on = true;
        }
        this.accStates.On = on;
        if (this.config.debugMsgLog) {
          this.log.info("Current On is: " + (this.accStates.On ? "ON": "OFF"));
        }
        this.lightbulbService.updateCharacteristic(this.api.hap.Characteristic.On, on);
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get On: %s", error.message);
        }
      });
  }

  async lightbulbSetOn(value: CharacteristicValue) {
    this.accStates.On = value as boolean;
    let url: String;
    let method: String;
    if (value) {
      url    = this.config.lightbulbSetOn.url;
      method = this.config.lightbulbSetOn.method.toLowerCase(); 
    } else {
      url    = this.config.lightbulbSetOff.url;
      method = this.config.lightbulbSetOff.method.toLowerCase(); 
    }
    axios({
      method: method,
      url: url
    })
      .then( (response: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("On was set to: " + (this.accStates.On ? "ON": "OFF"));
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set On: %s", error.message);
        }
      });
  }

  async lightbulbUpdateBrightness() {
    axios({
      method: this.config.lightbulbGetBrightness.method.toLowerCase(),
      url: this.config.lightbulbGetBrightness.url
    })
      .then( (response: any) => {
        let brightnessString: string = response.data.trim();
        if (this.config.lightbulbGetBrightness.removeBefore) {
          brightnessString = brightnessString.replace(this.config.lightbulbGetBrightness.removeBefore, "");
        }
        if (this.config.lightbulbGetBrightness.removeAfter) {
          brightnessString = brightnessString.replace(this.config.lightbulbGetBrightness.removeAfter, "");
        }
        const newBrightness: number = parseInt(brightnessString.trim(), 10);
        if (newBrightness >= 0 && newBrightness <= 100) {
          this.accStates.Brightness = newBrightness;
          if (this.config.debugMsgLog) {
            this.log.info("Brightness is: %i", this.accStates.Brightness);
          }
          this.lightbulbService.updateCharacteristic(this.api.hap.Characteristic.Brightness, this.accStates.Brightness);
        } else {
          if (this.config.debugMsgLog) {
            this.log.info("Current Brightness is not correct: '%s'! [0 - 100]", brightnessString.trim());
          }
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get Brightness: %s", error.message);
        }
      });
  }

  async lightbulbSetBrightness(value: CharacteristicValue) {
    this.accStates.Brightness = value as number;
    let url: string    = this.config.lightbulbSetBrightness.url;
    if (this.config.lightbulbSetBrightness.replaceNumber) {
      url = url.replace(this.config.lightbulbSetBrightness.replaceNumber, this.accStates.Brightness.toString());
    } else {
      url = url + this.accStates.Brightness.toString();
    }
    axios({
      method: this.config.lightbulbSetBrightness.method.toLowerCase(),
      url: url
    })
      .then( (response: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Brightness was set to: %i", this.accStates.Brightness);
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set Brightness: %s", error.message);
        }
      });
  }

  async lightbulbUpdateHue() {
    axios({
      method: this.config.lightbulbGetHue.method.toLowerCase(),
      url: this.config.lightbulbGetHue.url
    })
      .then( (response: any) => {
        let hueString: string = response.data.trim();
        if (this.config.lightbulbGetHue.removeBefore) {
          hueString = hueString.replace(this.config.lightbulbGetHue.removeBefore, "");
        }
        if (this.config.lightbulbGetHue.removeAfter) {
          hueString = hueString.replace(this.config.lightbulbGetHue.removeAfter, "");
        }
        const newHue: number = parseInt(hueString.trim(), 10);
        if (newHue >= 0 && newHue <= 360) {
          this.accStates.Hue = newHue;
          if (this.config.debugMsgLog) {
            this.log.info("Current Hue is: %i", this.accStates.Hue);
          }
          this.lightbulbService.updateCharacteristic(this.api.hap.Characteristic.Hue, this.accStates.Hue);
        } else {
          if (this.config.debugMsgLog) {
            this.log.info("Current Hue is not correct: '%s' (>> %i)! [0 - 360]", hueString.trim(), newHue);
          }
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get Hue: %s", error.message);
        }
      });
  }

  async lightbulbSetHue(value: CharacteristicValue) {
    this.accStates.Hue = value as number;
    let url: string    = this.config.lightbulbSetHue.url;
    if (this.config.lightbulbSetHue.replaceNumber) {
      url = url.replace(this.config.lightbulbSetHue.replaceNumber, this.accStates.Hue.toString());
    } else {
      url = url + this.accStates.Hue.toString();
    }
    // this.log.info(url);
    axios({
      method: this.config.lightbulbSetHue.method.toLowerCase(),
      url: url
    })
      .then( (response: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Lightbulb state hue was set to: %i", this.accStates.Hue);
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set Hue: %s", error.message);
        }
      });
  }

  async lightbulbUpdateColorTemperature() {
    axios({
      method: this.config.lightbulbGetColorTemperature.method.toLowerCase(),
      url: this.config.lightbulbGetColorTemperature.url
    })
      .then( (response: any) => {
        let colorTemperatureString: string = response.data.trim();
        if (this.config.lightbulbGetColorTemperature.removeBefore) {
          colorTemperatureString = colorTemperatureString.replace(this.config.lightbulbGetColorTemperature.removeBefore, "");
        }
        if (this.config.lightbulbGetColorTemperature.removeAfter) {
          colorTemperatureString = colorTemperatureString.replace(this.config.lightbulbGetColorTemperature.removeAfter, "");
        }
        let newColorTemperature: number = parseInt(colorTemperatureString.trim(), 10);
        if (this.config.lightbulbGetColorTemperature.unit == "kelvin") {
          if (newColorTemperature > 0) {
            newColorTemperature = (1000000 / newColorTemperature); // mired = 1000000 / kelvin
          }
        }
        if (newColorTemperature >= 140 && newColorTemperature <= 500) {
          this.accStates.ColorTemperature = newColorTemperature;
          if (this.config.debugMsgLog) {
            this.log.info("Current Color Temperature is: %i", this.accStates.ColorTemperature);
          }
          this.lightbulbService.updateCharacteristic(this.api.hap.Characteristic.ColorTemperature, this.accStates.ColorTemperature);
        } else {
          if (this.config.debugMsgLog) {
            this.log.info("Current Color Temperature is not correct: '%s' (>> %i mired)! [140 - 500 mired] [mired = 1000000 / kelvin]", colorTemperatureString.trim(), newColorTemperature);
          }
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get Color Temperature: %s", error.message);
        }
      });
  }

  async lightbulbSetColorTemperature(value: CharacteristicValue) {
    this.accStates.ColorTemperature = value as number;
    let newColorTemperature: number = this.accStates.ColorTemperature;
    if (this.config.lightbulbSetColorTemperature.unit == "kelvin") {
      if (newColorTemperature > 0) {
        newColorTemperature = (1000000 / newColorTemperature); // kelvin = 1000000 / mired
      }
    }
    let url: string    = this.config.lightbulbSetColorTemperature.url;
    if (this.config.lightbulbSetColorTemperature.replaceNumber) {
      url = url.replace(this.config.lightbulbSetColorTemperature.replaceNumber, newColorTemperature.toString());
    } else {
      url = url + newColorTemperature.toString();
    }
    axios({
      method: this.config.lightbulbSetColorTemperature.method.toLowerCase(),
      url: url
    })
      .then( (response: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Color Temperature was set to: %i", this.accStates.ColorTemperature);
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set Color Temperature: %s", error.message);
        }
      });
  }

  async switchUpdateOn() {
    axios({
      method: this.config.switchGetOn.method.toLowerCase(),
      url: this.config.switchGetOn.url
    })
      .then( (response: any) => {
        // this.log(response.data.trim());
        let on = false;
        if (response.data.trim() == this.config.switchGetOn.pattern) {
          on = true;
        }
        this.accStates.On = on;
        if (this.config.debugMsgLog) {
          this.log.info("Current On is: " + (this.accStates.On ? "ON": "OFF"));
        }
        this.switchService.updateCharacteristic(this.api.hap.Characteristic.On, on);
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get On: %s", error.message);
        }
      });
  }

  async switchSetOn(value: CharacteristicValue) {
    this.accStates.On = value as boolean;
    let url: String;
    let method: String;
    if (value) {
      url    = this.config.switchSetOn.url;
      method = this.config.switchSetOn.method.toLowerCase(); 
    } else {
      url    = this.config.switchSetOff.url;
      method = this.config.switchSetOff.method.toLowerCase(); 
    }
    axios({
      method: method,
      url: url
    })
      .then( (response: any) => {
        // this.log(response.data.trim());
        if (this.config.debugMsgLog) {
          this.log.info("On was set to: " + (this.accStates.On ? "ON": "OFF"));
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set On: %s", error.message);
        }
      });
  }

  async outletUpdateOn() {
    axios({
      method: this.config.outletGetOn.method.toLowerCase(),
      url: this.config.outletGetOn.url
    })
      .then( (response: JSON) => {
        this.log(response["headers"]["content-type"]);
        this.log(response["data"]);
        this.log(this.config.outletGetOn.pattern);
        let x: String = response["data"];
        this.log("-" + x + "-");
        let on = false;
        if (x == this.config.outletGetOn.pattern) {
          on = true;
        }
        this.accStates.On = on;
        if (this.config.debugMsgLog) {
          this.log.info("Current On is: " + (this.accStates.On ? "ON": "OFF"));
        }
        this.outletService.updateCharacteristic(this.api.hap.Characteristic.On, on);
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Get On: %s", error.message);
        }
      });
  }

  async outletSetOn(value: CharacteristicValue) {
    this.accStates.On = value as boolean;
    let url: String;
    let method: String;
    if (value) {
      url    = this.config.outletSetOn.url;
      method = this.config.outletSetOn.method.toLowerCase(); 
    } else {
      url    = this.config.outletSetOff.url;
      method = this.config.outletSetOff.method.toLowerCase(); 
    }
    axios({
      method: method,
      url: url
    })
      .then( (response: any) => {
        // this.log(response.data.trim());
        if (this.config.debugMsgLog) {
          this.log.info("On was set to: " + (this.accStates.On ? "ON": "OFF"));
        }
      })
      .catch( (error: any) => {
        if (this.config.debugMsgLog) {
          this.log.info("Error in Set On: %s", error.message);
        }
      });
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