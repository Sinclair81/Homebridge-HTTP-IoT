import {
  AccessoryConfig,
  API,
  CharacteristicValue,
  Logging
} from "homebridge";

const axios = require('axios').default;

export class SwitchAccessory {

  static switchType: string = "switch";
  static infoModel: string  = "Switch";

  public switchService: any;

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
        if (this.switchCheckOnOff()) {
          this.switchUpdateOn();
        }
      }, this.config.updateIntervall);
    }

  }

  async switchUpdateOn() {
    axios({
      method: this.config.switchGetOn.method.toLowerCase(),
      url: this.config.switchGetOn.url
    })
      .then( (response: any) => {
        let on = this.checkOnRespons(response);
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

  checkOnRespons(response: any): boolean {
    let on = false;
    let responseType: string = response["headers"]["content-type"];
    responseType = responseType.toLocaleLowerCase();
    let responseData: string;
    if (responseType.indexOf("text") != -1) { // text/plain
      responseData = response.data.trim();
      if (responseData == this.config.switchGetOn.pattern) {
        on = true;
      }
    } else {                                  // application/json
      responseData = JSON.stringify(response.data);
      if (responseData == this.config.switchGetOn.pattern) {
        on = true;
      }
    }
    if (this.config.debugMsgLog) {
      this.log.info("On response type is '" + responseType + "' and data is '" + responseData + "'");
    }
    return on;
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

}