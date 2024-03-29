import {
  AccessoryConfig,
  API,
  CharacteristicValue,
  Logging
} from "homebridge";

const axios = require('axios').default;

export class LightbulbAccessory {

  static lightbulbType: string = "lightbulb";
  static infoModel: string     = "Lightbulb";

  public lightbulbService: any;

  log: Logging;
  config: AccessoryConfig;
  accStates: any;
  api: API;

  constructor(log: Logging,
              config: AccessoryConfig,
              accStates: any,
              api: API
              ) {

    this.log       = log;
    this.config    = config;
    this.accStates = accStates;
    this.api       = api;

    if (this.config.updateIntervall > 0) {
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

  async lightbulbUpdateOn() {
    axios({
      method: this.config.lightbulbGetOn.method.toLowerCase(),
      url: this.config.lightbulbGetOn.url
    })
      .then( (response: any) => {
        let on = this.checkOnRespons(response);
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

  checkOnRespons(response: any): boolean {
    let on = false;
    let responseType: string = response["headers"]["content-type"];
    responseType = responseType.toLocaleLowerCase();
    let responseData: string;
    if (responseType.indexOf("text") != -1) { // text/plain
      responseData = response.data.trim();
      if (responseData == this.config.lightbulbGetOn.pattern) {
        on = true;
      }
    } else {                                  // application/json
      responseData = JSON.stringify(response.data);
      if (responseData == this.config.lightbulbGetOn.pattern) {
        on = true;
      }
    }
    if (this.config.debugMsgLog) {
      this.log.info("On response type is '" + responseType + "' and data is '" + responseData + "'");
    }
    return on;
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

}