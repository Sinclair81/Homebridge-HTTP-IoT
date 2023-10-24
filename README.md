<p align="center">
<img src="https://github.com/homebridge/branding/blob/latest/logos/homebridge-wordmark-logo-horizontal.png" width="300">
</p>

# Homebridge HTTP IoT #

[![npm version](https://badge.fury.io/js/homebridge-http-iot.svg)](https://badge.fury.io/js/homebridge-http-iot)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://img.shields.io/npm/dt/homebridge-http-iot.svg?label=downloads)](https://www.npmjs.com/package/homebridge-http-iot)
[![donate](https://img.shields.io/badge/donate-PayPal-blue.svg)](https://www.paypal.me/Sinclair81)

Control your IoT device with HTTP requests.

__Type of Accessory:__

- Lightbulb
- Switch
- Outlet

__Configuration:__

- [Main Configuration](#HTTP-IoT-Main-Configuration-Parameters)  
- [Lightbulb On Configuration](#Lightbulb-On-Configuration-Parameters)  
- [Lightbulb Brightness Configuration](#Lightbulb-Brightness-Configuration-Parameters-(is-Optional))  
- [Lightbulb Hue Configuration](#Lightbulb-Hue-Configuration-Parameters-(is-Optional))  
- [Lightbulb Color Temperature Configuration](#Lightbulb-Color-Temperature-Configuration-Parameters-(is-Optional))  
- [Lightbulb Example Configuration](#Lightbulb-Example-Configuration)  
- [Switch Configuration](#Switch-Configuration-Parameters)  
- [Outlet Configuration](#Outlet-Configuration-Parameters)  

## Installation ##

1. Install homebridge using instruction from: [Homebridge WiKi](https://github.com/homebridge/homebridge/wiki)
2. Install this plugin in your homebridge
3. Update your configuration file with code like the sample below

## HTTP IoT Main Configuration Parameters ##

Name                     | Value               | Required | Notes
------------------------ | ------------------- | -------- | ------------------------
`accessory`              | "HTTP-IoT"          | yes      | Must be set to `"HTTP-IoT"`.
`name`                   | (custom)            | yes      | Name of accessory that will appear in homekit app.
`type`                   | "lightbulb"         | no       | Type of accessory `"lightbulb"`, `"switch"` or `"outlet"`, default is: `"lightbulb"`.
`updateInterval`         | 0                   | no       | Auto Update Interval in milliseconds, 0 = Off
`debugMsgLog`            | 0                   | no       | 1 - Displays messages of accessories in the log.

## Lightbulb On Configuration Parameters ##

Name                     | Value                       | Required | Notes
------------------------ | --------------------------- | -------- | ------------------------
`lightbulbGetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to get the state.  
`lightbulbGetOn.method`  | "GET"                       | yes      | The HTTP method.  
`lightbulbGetOn.pattern` | "power: 1"                  | yes      | The response for a `on` or `1`  
`lightbulbSetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to set ON.  
`lightbulbSetOn.method`  | "POST"                      | yes      | The HTTP method.  
`lightbulbSetOff.url`    | "http://10.0.0.100/api/..." | yes      | The url for power control, to set OFF.  
`lightbulbSetOff.method` | "POST"                      | yes      | The HTTP method.  

## Lightbulb Brightness Configuration Parameters (is Optional) ##

Name                                   | Value                       | Required | Notes
-------------------------------------- | --------------------------- | -------- | ------------------------
`lightbulbGetBrightness.url`           | "http://10.0.0.100/api/..." | yes*     | The url for brightness control, to get the state.  
`lightbulbGetBrightness.method`        | "GET"                       | yes*     | The HTTP method.  
`lightbulbGetBrightness.removeBefore`  | "brightness: "              | no       | Remove this string in the response before the value.  
`lightbulbGetBrightness.removeAfter`   | ""                          | no       | Remove this string in the response after the value.  
`lightbulbSetBrightness.url`           | "http://10.0.0.100/api/..." | yes*     | The url for brightness control.  
`lightbulbSetBrightness.method`        | "POST"                      | yes*     | The HTTP method.  
`lightbulbSetBrightness.replaceNumber` | "%brightness%"              | no       | This string is replace with the value in the url. If not set, the value is add to the url.  

## Lightbulb Hue Configuration Parameters (is Optional) ##

Name                            | Value                       | Required | Notes
------------------------------- | --------------------------- | -------- | ------------------------
`lightbulbGetHue.url`           | "http://10.0.0.100/api/..." | yes*     | The url for hue control, to get the state.  
`lightbulbGetHue.method`        | "GET"                       | yes*     | The HTTP method.  
`lightbulbGetHue.removeBefore`  | "hue: "                     | no       | Remove this string in the response before the value.  
`lightbulbGetHue.removeAfter`   | ""                          | no       | Remove this string in the response after the value.  
`lightbulbSetHue.url`           | "http://10.0.0.100/api/..." | yes*     | The url for hue control.  
`lightbulbSetHue.method`        | "POST"                      | yes*     | The HTTP method.  
`lightbulbSetHue.replaceNumber` | "%hue%"                     | no       | This string is replace with the value in the url. If not set, the value is add to the url.  

## Lightbulb Color Temperature Configuration Parameters (is Optional) ##

The Home app in IOS crashes when trying to change this value as a color instead of the color temperature. (10'2023)

Name                                         | Value                       | Required | Notes
-------------------------------------------- | --------------------------- | -------- | ------------------------
`lightbulbGetColorTemperature.url`           | "http://10.0.0.100/api/..." | yes*     | The url for color temperature control, to get the state.  
`lightbulbGetColorTemperature.method`        | "GET"                       | yes*     | The HTTP method.  
`lightbulbGetColorTemperature.removeBefore`  | "color_temp: "              | no       | Remove this string in the response before the value.  
`lightbulbGetColorTemperature.removeAfter`   | ""                          | no       | Remove this string in the response after the value.  
`lightbulbSetColorTemperature.url`           | "http://10.0.0.100/api/..." | yes*     | The url for color temperature control.  
`lightbulbSetColorTemperature.method`        | "POST"                      | yes*     | The HTTP method.  
`lightbulbSetColorTemperature.replaceNumber` | "%color_temp%"              | no       | This string is replace with the value in the url. If not set, the value is add to the url.  
`lightbulbSetColorTemperature.unit`          | "kelvin"                    | no       | Set unit to `"kelvin"` if the device supports Kelvin instead of HomeKit unit Mired. (Mired = 1,000,000 / Kelvin)  

## Lightbulb Example Configuration ##

```json
"accessories": [
        {
            "accessory": "HTTP-IoT",
            "name": "Spöka 2.0",
            "type": "lightbulb",
            "updateIntervall": 10000,
            "debugMsgLog": 1,
            "lightbulbGetOn": {
                "url": "http://10.0.0.100/api/v1/led?power",
                "method": "GET",
                "pattern": "power: 1"
            },
            "lightbulbSetOn": {
                "url": "http://10.0.0.100/api/v1/led?power=1",
                "method": "POST"
            },
            "lightbulbSetOff": {
                "url": "http://10.0.0.100/api/v1/led?power=0",
                "method": "POST"
            },
            "lightbulbGetBrightness": {
                "url": "http://10.0.0.100/api/v1/led?brightness",
                "method": "GET",
                "removeBefore": "brightness: "
            },
            "lightbulbSetBrightness": {
                "url": "http://10.0.0.100/api/v1/led?brightness=%brightness%",
                "method": "POST",
                "replaceNumber": "%brightness%"
            },
            "lightbulbGetHue": {
                "url": "http://10.0.0.100/api/v1/led?hue",
                "method": "GET",
                "removeBefore": "hue: "
            },
            "lightbulbSetHue": {
                "url": "http://10.0.0.100/api/v1/led?hue=%hue%",
                "method": "POST",
                "replaceNumber": "%hue%"
            },
            "lightbulbGetColorTemperature": {
                "url": "http://10.0.0.100/api/v1/led?color_temp",
                "method": "GET",
                "removeBefore": "color_temp: ",
                "unit": "kelvin"
            },
            "lightbulbSetColorTemperature": {
                "url": "http://10.0.0.100/api/v1/led?color_temp=%color_temp%",
                "method": "POST",
                "replaceNumber": "%color_temp%",
                "unit": "kelvin"
            }
        }
    ]
```

## Switch Configuration Parameters ##

Name                  | Value                       | Required | Notes
----------------------| --------------------------- | -------- | ------------------------
`switchGetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to get the state.  
`switchGetOn.method`  | "GET"                       | yes      | The HTTP method.  
`switchGetOn.pattern` | "power: 1"                  | yes      | The response for a `on` or `1`  
`switchSetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to set ON.  
`switchSetOn.method`  | "POST"                      | yes      | The HTTP method.  
`switchSetOff.url`    | "http://10.0.0.100/api/..." | yes      | The url for power control, to set OFF.  
`switchSetOff.method` | "POST"                      | yes      | The HTTP method.  

```json
"accessories": [
        {
            "accessory": "HTTP-IoT",
            "name": "HTTP Switch",
            "type": "switch",
            "updateIntervall": 10000,
            "debugMsgLog": 1,
            "switchGetOn": {
                "url": "http://10.0.0.100/api/v1/led?power",
                "method": "GET",
                "pattern": "power: 1"
            },
            "switchSetOn": {
                "url": "http://10.0.0.100/api/v1/led?power=1",
                "method": "POST"
            },
            "switchSetOff": {
                "url": "http://10.0.0.100/api/v1/led?power=0",
                "method": "POST"
            }
        }
    ]
```

## Outlet Configuration Parameters ##

Name                  | Value                       | Required | Notes
----------------------| --------------------------- | -------- | ------------------------
`outletGetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to get the state.  
`outletGetOn.method`  | "GET"                       | yes      | The HTTP method.  
`outletGetOn.pattern` | "power: 1"                  | yes      | The response for a `on` or `1`  
`outletSetOn.url`     | "http://10.0.0.100/api/..." | yes      | The url for power control, to set ON.  
`outletSetOn.method`  | "POST"                      | yes      | The HTTP method.  
`outletSetOff.url`    | "http://10.0.0.100/api/..." | yes      | The url for power control, to set OFF.  
`outletSetOff.method` | "POST"                      | yes      | The HTTP method.  

```json
"accessories": [
        {
            "accessory": "HTTP-IoT",
            "name": "HTTP Outlet",
            "type": "outlet",
            "updateIntervall": 10000,
            "debugMsgLog": 1,
            "outletGetOn": {
                "url": "http://10.0.0.100/api/v1/led?power",
                "method": "GET",
                "pattern": "power: 1"
            },
            "outletSetOn": {
                "url": "http://10.0.0.100/api/v1/led?power=1",
                "method": "POST"
            },
            "outletSetOff": {
                "url": "http://10.0.0.100/api/v1/led?power=0",
                "method": "POST"
            }
        }
    ]
```

## Test Homebridge HTTP IoT ##

1. Download or clone Homebridge-HTTP-IoT.
2. Install: `$ npm install`
3. Build:   `$ npm run build`
4. Run:     `$ homebridge -D -P ~/Homebridge-HTTP-IoT`
