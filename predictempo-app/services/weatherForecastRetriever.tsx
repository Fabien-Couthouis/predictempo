

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
    temperature2mMax: number; // TX
    temperature2mMin: number; // TN
};

export type WeatherDataPredictions = {
    city: string;
    dailyPredictions: DailyWeatherData[];
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
    "BORDEAUX": new Coordinate(44.837789, -0.57918),
    "PARIS": new Coordinate(48.856613, 2.352222),
    "MARSEILLE": new Coordinate(43.296346, 5.369889),
    "LYON": new Coordinate(45.75, 4.85),
    "TOULOUSE": new Coordinate(43.604652, 1.444209),
    "NICE": new Coordinate(43.710173, 7.261953),
    "NANTES": new Coordinate(47.218371, -1.553621),
    "STRASBOURG": new Coordinate(48.5734053, 7.7521113),
    "MONTPELLIER": new Coordinate(43.610769, 3.876716),
    "BREST": new Coordinate(48.390394, -4.486076),
    "NANCY": new Coordinate(48.692054, 6.184417),
    "LILLE": new Coordinate(50.62925, 3.057256),
    "RENNES": new Coordinate(48.117266, -1.677792),
    "TOULON": new Coordinate(43.124228, 5.928),
}

const processWeatherResponse = (responses: any, cities: readonly string[]) => {
    const predictions: WeatherDataPredictions[] = [];
    for (let i = 0; i < cities.length; i++) {
        const response = responses[i];
        const city = cities[i];

        const utcOffsetSeconds = response.utcOffsetSeconds();
        const daily = response.daily()!;
        const nTempDecimals = 1;
        const weatherData: DailyWeatherData[] = Array.from(daily.variables(0)!.valuesArray()!).map((_, index) => ({
            city: city,
            time: new Date((Number(daily.time()) + index * Number(daily.interval()) + Number(utcOffsetSeconds)) * 1000),
            temperature2mMax: Number(daily.variables(0)!.valuesArray()![index].toFixed(nTempDecimals)),
            temperature2mMin: Number(daily.variables(1)!.valuesArray()![index].toFixed(nTempDecimals)),
        }));

        const prediction: WeatherDataPredictions = {
            city: city,
            dailyPredictions: weatherData
        };
        predictions.push(prediction);
    }

    return predictions;
}

export const retrieveWeatherPredictions = async (cities: readonly string[], nDaysToPredict: Number = 4) => {
    try {
        const latitudes: number[] = [];
        const longitudes: number[] = [];
        cities.forEach(city => {
            const coordinate = cityNameToLatitudeLongitude[city.toUpperCase()];
            if (!coordinate) {
                throw new UndefinedCityError(`City name ${city} is not supported.`);
            }
            latitudes.push(coordinate.latitude);
            longitudes.push(coordinate.longitude);
        });

        const params = {
            "latitude": latitudes,
            "longitude": longitudes,
            "daily": ["temperature_2m_max", "temperature_2m_min"],
            "models": "meteofrance_seamless",
            "forecast_days": nDaysToPredict,
        };
        const responses = await fetchWeatherApi(API_URL, params);

        if (!responses || responses.length === 0) {
            throw new FetchWeatherError('No response from the weather API');
        }

        return processWeatherResponse(responses, cities);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
};

