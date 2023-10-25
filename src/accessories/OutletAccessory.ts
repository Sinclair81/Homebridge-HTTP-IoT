import {
  AccessoryConfig,
  API,
  CharacteristicValue,
  Logging
} from "homebridge";

const axios = require('axios').default;

export class OutletAccessory {

  static outletType: string = "outlet";
  static infoModel: string  = "Outlet";

  public outletService: any;

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
        if (this.outletCheckOnOff()) {
          this.outletUpdateOn();
        }
      }, this.config.updateIntervall);
    }

  }

  async outletUpdateOn() {
    axios({
      method: this.config.outletGetOn.method.toLowerCase(),
      url: this.config.outletGetOn.url
    })
      .then( (response: any) => {
        let on = this.checkOnRespons(response);
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

  checkOnRespons(response: any): boolean {
    let on = false;
    let responseType: string = response["headers"]["content-type"];
    responseType = responseType.toLocaleLowerCase();
    let responseData: string;
    if (responseType.indexOf("text") != -1) { // text/plain
      responseData = response.data.trim();
      if (responseData == this.config.outletGetOn.pattern) {
        on = true;
      }
    } else {                                  // application/json
      responseData = JSON.stringify(response.data);
      if (responseData == this.config.outletGetOn.pattern) {
        on = true;
      }
    }
    if (this.config.debugMsgLog) {
      this.log.info("On response type is '" + responseType + "' and data is '" + responseData + "'");
    }
    return on;
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

}