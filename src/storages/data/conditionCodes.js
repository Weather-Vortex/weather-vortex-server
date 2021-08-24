module.exports.openWeatherMap = new Map([
  {
    id: 200,
    main: "Thunderstorm",
    description: "thunderstorm with light rain",
    icon: "11d",
    vortex: 12,
  },
  {
    id: 201,
    main: "Thunderstorm",
    description: "thunderstorm with rain",
    icon: "11d",
    vortex: 13,
  },
  {
    id: 202,
    main: "Thunderstorm",
    description: "thunderstorm with heavy rain",
    icon: "11d",
    vortex: 14,
  },
  {
    id: 210,
    main: "Thunderstorm",
    description: "light thunderstorm",
    icon: "11d",
    vortex: 15,
  },
  {
    id: 211,
    main: "Thunderstorm",
    description: "thunderstorm",
    icon: "11d",
    vortex: 16,
  },
  {
    id: 212,
    main: "Thunderstorm",
    description: "heavy thunderstorm",
    icon: "11d",
  },
  {
    id: 221,
    main: "Thunderstorm",
    description: "ragged thunderstorm",
    icon: "11d",
    vortex: 18,
  },
  {
    id: 230,
    main: "Thunderstorm",
    description: "thunderstorm with light drizzle",
    icon: "11d",
    vortex: 19,
  },
  {
    id: 231,
    main: "Thunderstorm",
    description: "thunderstorm with drizzle",
    icon: "11d",
    vortex: 20,
  },
  {
    id: 232,
    main: "Thunderstorm",
    description: "thunderstorm with heavy drizzle",
    icon: "11d",
    vortex: 21,
  },
  {
    id: 300,
    main: "Drizzle",
    description: "light intensity drizzle",
    icon: "09d",
    vortex: 22,
  },
  { id: 301, main: "Drizzle", description: "drizzle", icon: "09d", vortex: 23 },
  {
    id: 302,
    main: "Drizzle",
    description: "heavy intensity drizzle",
    icon: "09d",
    vortex: 24,
  },
  {
    id: 310,
    main: "Drizzle",
    description: "light intensity drizzle rain",
    icon: "09d",
    vortex: 25,
  },
  { ID: "311", Main: "Drizzle", Description: "drizzle rain", Icon: "09d" }, // To convert
  {
    ID: "312",
    Main: "Drizzle",
    Description: "heavy intensity drizzle rain",
    Icon: "09d",
  }, // To convert
  {
    ID: "313",
    Main: "Drizzle",
    Description: "shower rain and drizzle",
    Icon: "09d",
  }, // To convert
  {
    ID: "314",
    Main: "Drizzle",
    Description: "heavy shower rain and drizzle",
    Icon: "09d",
  }, // To convert
  { ID: "321", Main: "Drizzle", Description: "shower drizzle", Icon: "09d" }, // To convert
  { id: 500, main: "Rain", description: "Light rain", icon: "10d", vortex: 6 },
  {
    id: 501,
    main: "Rain",
    description: "moderate rain",
    icon: "10d",
    vortex: 7,
  },
  {
    id: 502,
    main: "Rain",
    description: "heavy intensity rain",
    icon: "10d",
    vortex: 8,
  },
  {
    id: 503,
    main: "Rain",
    description: "very heavy rain",
    icon: "10d",
    vortex: 9,
  },
  {
    id: 504,
    main: "Rain",
    description: "extreme rain",
    icon: "10d",
    vortex: 10,
  },
  {
    id: 511,
    main: "Rain",
    description: "freezing rain",
    icon: "13d",
    vortex: 11,
  }, // To convert
  {
    ID: "520",
    Main: "Rain",
    Description: "light intensity shower rain",
    Icon: "09d",
  }, // To convert
  { ID: "521", Main: "Rain", Description: "shower rain", Icon: "09d" }, // To convert
  {
    ID: "522",
    Main: "Rain",
    Description: "heavy intensity shower rain",
    Icon: "09d",
  }, // To convert
  { ID: "531", Main: "Rain", Description: "ragged shower rain", Icon: "09d" }, // To convert
  { ID: "600", Main: "Snow", Description: "light snow", Icon: "13d" }, // To convert
  { ID: "601", Main: "Snow", Description: "Snow", Icon: "13d" }, // To convert
  { ID: "602", Main: "Snow", Description: "Heavy snow", Icon: "13d" }, // To convert
  { ID: "611", Main: "Snow", Description: "Sleet", Icon: "13d" }, // To convert
  { ID: "612", Main: "Snow", Description: "Light shower sleet", Icon: "13d" }, // To convert
  { ID: "613", Main: "Snow", Description: "Shower sleet", Icon: "13d" }, // To convert
  { ID: "615", Main: "Snow", Description: "Light rain and snow", Icon: "13d" }, // To convert
  { ID: "616", Main: "Snow", Description: "Rain and snow", Icon: "13d" }, // To convert
  { ID: "620", Main: "Snow", Description: "Light shower snow", Icon: "13d" }, // To convert
  { ID: "621", Main: "Snow", Description: "Shower snow", Icon: "13d" }, // To convert
  { ID: "622", Main: "Snow", Description: "Heavy shower snow", Icon: "13d" }, // To convert
  { ID: "701", Main: "Mist", Description: "mist", Icon: "50d" }, // To convert
  { ID: "711", Main: "Smoke", Description: "Smoke", Icon: "50d" }, // To convert
  { ID: "721", Main: "Haze", Description: "Haze", Icon: "50d" }, // To convert
  { ID: "731", Main: "Dust", Description: "sand/ dust whirls", Icon: "50d" }, // To convert
  { id: 741, main: "Fog", description: "fog", icon: "50d", vortex: 50 }, // To convert
  { ID: "751", Main: "Sand", Description: "sand", Icon: "50d" }, // To convert
  { ID: "761", Main: "Dust", Description: "dust", Icon: "50d" }, // To convert
  { ID: "762", Main: "Ash", Description: "volcanic ash", Icon: "50d" }, // To convert
  { ID: "771", Main: "Squall", Description: "squalls", Icon: "50d" }, // To convert
  { ID: "781", Main: "Tornado", Description: "tornado", Icon: "50d" }, // To convert
  {
    id: 800,
    main: "Clear",
    description: "Clear sky",
    icon: "01d  01n",
    vortex: 1,
  },
  {
    id: 801,
    main: "Clouds",
    description: "few clouds: 11-25%",
    icon: "02d  02n",
    vortex: 2,
  },
  {
    id: 802,
    main: "Clouds",
    description: "scattered clouds: 25-50%",
    icon: "03d  03n",
    vortex: 3,
  },
  {
    id: 803,
    main: "Clouds",
    description: "broken clouds: 51-84%",
    icon: "04d  04n",
    vortex: 4,
  },
  {
    id: 804,
    main: "Clouds",
    description: "overcast clouds: 85-100%",
    icon: "04d  04n",
    vortex: 5,
  },
]);

/*
Troposphere missing by those vortex condition codes [2, 4].
*/
module.exports.troposphere = new Map([
  { type: "clear", description: "Clear sky", vortex: 1 },
  { type: "partly-cloudy", description: "Partly cloudy", vortex: 3 },
  { type: "cloudy", description: "Cloudy", vortex: 5 },
  { "": "", "Weather type": "dust", Description: "Dust" }, // To convert
  { "": "", "Weather type": "mist", Description: "Mist" }, // To convert
  { type: "fog", Description: "Fog", vortex: 50 },
  { type: "rain", description: "Rain", vortex: 8 },
  { "": "", "Weather type": "snow", Description: "Snow" }, // To convert
  { "": "", "Weather type": "sandstorm", Description: "Sandstorm" }, // To convert
  { "": "", "Weather type": "snowdrifting", Description: "Snowdrifting" }, // To convert
  { "": "", "Weather type": "drizzle", Description: "Drizzle" }, // To convert
  { "": "", "Weather type": "rain-freezing", Description: "Rain (freezing)" }, // To convert
  { "": "", "Weather type": "sleet", Description: "Sleet" }, // To convert
  { type: "rain-showers", description: "Rain showers", vortex: 7 },
  {
    "": "",
    "Weather type": "rain-snow-shower",
    Description: "Rain/snow shower",
  }, // To convert
  { "": "", "Weather type": "snow-shower", Description: "Snow shower" }, // To convert
  { "": "", "Weather type": "snow-hail", Description: "Snow / Hail" }, // To convert
  { "": "", "Weather type": "hail", Description: "Hail" }, // To convert
  { type: "thunderstorm", description: "Thunderstorm", vortex: 16 },
]);

module.exports.vortex = new Map([
  { id: 1, description: "Clear sky", icon: "mdi-weather-sunny" },
  { id: 2, description: "Few clouds", icon: "mdi-partly-cloudy" },
  { id: 3, description: "Scattered clouds", icon: "mdi-partly-cloudy" },
  { id: 4, description: "Broken clouds", icon: "mdi-weather-cloudy" },
  { id: 5, description: "Overcast clouds", icon: "mdi-weather-cloudy" },
  { id: 6, description: "Light rain", icon: "mdi-weather-partly-rainy" },
  { id: 7, description: "Moderate rain", icon: "mdi-weather-partly-rainy" },
  { id: 8, description: "Heavy intensity rain", icon: "mdi-weather-rainy" },
  { id: 9, description: "Very heavy rain", icon: "mdi-weather-pouring" },
  { id: 10, description: "Extreme rain", icon: "mdi-weather-pouring" },
  { id: 11, description: "Freezing rain", icon: "mdi-weather-snowy-rainy" },
  {
    id: 12,
    description: "Thunderstorm with light rain",
    icon: "mdi-weather-lightning",
  },
  {
    id: 13,
    description: "Thunderstorm with rain",
    icon: "mdi-weather-lightning",
  },
  { id: 14, description: "Thunderstorm with heavy rain" },
  { id: 15, description: "Light thunderstorm", icon: "mdi-weather-lightning" },
  { id: 16, description: "Thunderstorm", icon: "mdi-weather-lightning" },
  { id: 17, description: "Heavy thunderstorm", icon: "mdi-weather-lightning" },
  { id: 18, description: "Ragged Thunderstorm", icon: "mdi-weather-lightning" },
  {
    id: 19,
    description: "Thunderstorm with light drizzle",
    icon: "mdi-weather-lighting",
  },
  {
    id: 20,
    description: "Thunderstorm with drizzle",
    icon: "mdi-weather-lightning",
  },
  {
    id: 21,
    description: "Thunderstorm with heavy drizzle",
    icon: "mdi-weather-lightning",
  },
  { id: 22, description: "Light intensity drizzle", icon: "mdi-weather-rainy" },
  { id: 23, description: "drizzle", icon: "mdi-weather-rainy" },
  { id: 24, description: "Heavy intensity drizzle", icon: "mdi-weather-rainy" },
  {
    id: 25,
    description: "Light intensity drizzle rain",
    icon: "mdi-weather-rainy",
  },
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 18, description: "", icon: "" }, // Reserved for 230
  { id: 50, description: "Fog", icon: "mdi-weather-fog" }, // Reserved for 230
]);
