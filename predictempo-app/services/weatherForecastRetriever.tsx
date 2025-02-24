

import { fetchWeatherApi } from 'openmeteo';

const API_URL = "https://api.open-meteo.com/v1/forecast";

class UndefinedCityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UndefinedCityError';
    }
}

export class FetchWeatherError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FetchWeatherError';
    }
}

export type DailyWeatherData = {
    city: string;
    time: Date;
    temperature2mMax: number;
    temperature2mMin: number;
};


class Coordinate {
    latitude: number;
    longitude: number;
    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

const cityNameToLatitudeLongitude: { [key: string]: Coordinate } = {
    "Bordeaux": new Coordinate(44.837789, -0.57918),
    "Paris": new Coordinate(48.856613, 2.352222),
    "Marseille": new Coordinate(43.296346, 5.369889),
    "Lyon": new Coordinate(45.75, 4.85),
    "Toulouse": new Coordinate(43.604652, 1.444209),
    "Nice": new Coordinate(43.710173, 7.261953),
    "Nantes": new Coordinate(47.218371, -1.553621),
    "Strasbourg": new Coordinate(48.5734053, 7.7521113),
    "Montpellier": new Coordinate(43.610769, 3.876716),
    "Brest": new Coordinate(48.390394, -4.486076),
    "Nancy": new Coordinate(48.692054, 6.184417),
    "Lille": new Coordinate(50.62925, 3.057256)
}

export const retrieveWeather = async (city: string) => {
    try {
        const coordinate = cityNameToLatitudeLongitude[city];
        if (!coordinate) {
            throw new UndefinedCityError(`City name ${city} is not supported.`);
        }

        const params = {
            "latitude": coordinate.latitude,
            "longitude": coordinate.longitude,
            "daily": ["temperature_2m_max", "temperature_2m_min"],
            "models": "meteofrance_seamless"
        };
        const responses = await fetchWeatherApi(API_URL, params);

        if (!responses || responses.length === 0) {
            throw new FetchWeatherError('No response from weather API');
        }

        // Process first location. Add a for-loop for multiple locations or weather models TODO
        const response = responses[0];
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const daily = response.daily()!;
        const nTempDecimals = 1;
        const weatherData: DailyWeatherData[] = Array.from(daily.variables(0)!.valuesArray()!).map((_, index) => ({
            city: city,
            time: new Date((Number(daily.time()) + index * Number(daily.interval()) + Number(utcOffsetSeconds)) * 1000),
            temperature2mMax: Number(daily.variables(0)!.valuesArray()![index].toFixed(nTempDecimals)),
            temperature2mMin: Number(daily.variables(1)!.valuesArray()![index].toFixed(nTempDecimals)),
        }));

        return weatherData;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
};

