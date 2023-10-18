# Panda Weather

## Short description
This multi-language web application is designed to view the weather forecast for cities 1 day/week ahead, with the ability to add/remove cities from your favorites. The ability to view the day/night forecast and select the units of measurement has also been added

## Using technologies
Vue, Vite, Vue-router, Chart.js, Axios, Scss, Npm, I18n

## How to start
Install this repo, then run the comand `npm run dev`  

## API
```
https://api.ipdata.co?api-key=${ip_api_key}    // get user's current location by IP
```

```
https://api.openweathermap.org/data/2.5/forecast?
q=${obj.city}                                     // get weather forecast by city
&appid=${weather_api_key}
&lang=${locale.value}                             // with specific lang response
&units=${obj.display_data.selected_measure.name}  // and with selected unit of measurment  
```
