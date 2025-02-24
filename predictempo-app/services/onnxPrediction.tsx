import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { DailyWeatherData, retrieveWeather, FetchWeatherError } from './weatherForecastRetriever';

class OnnxModelNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OnnxModelNotFoundError';
    }
}

class OnnxInferenceError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OnnxInferenceError';
    }
}

const loadModelAssetAndCreateSession = async (modelRequire: string) => {
    const assets = await Asset.loadAsync(modelRequire);
    const modelUri = assets[0].localUri;
    if (!modelUri) {
        throw new OnnxModelNotFoundError(`Failed to get model URI: ${assets[0]}`);
    }

    return InferenceSession.create(modelUri, { executionProviders: ['cpu'] });
}

const retrieveInputData = async (date: Date) => {
    const inputData = new Float32Array(20).fill(0);
    const city = "Paris";
    const weatherData = await retrieveWeather(city);
    if (!weatherData) {
        throw new FetchWeatherError(`Failed to fetch weather data for ${city}`);
    }

    // Display the data
    for (let i = 0; i < weatherData.length; i++) {
        console.log(
            'Weather data',
            city,
            weatherData[i].time.toISOString(),
            weatherData[i].temperature2mMax,
            weatherData[i].temperature2mMin
        );
    }
    return inputData;
}

export const isRedDay = async (date: Date) => {
    try {
        const modelRequire = require('../assets/neural_networks/lgbm_model_red_days_2025_02_21.onnx')
        let session = await loadModelAssetAndCreateSession(modelRequire)
        const inputData = await retrieveInputData(date);

        // Run inference
        const feeds: Record<string, Tensor> = {};
        feeds[session.inputNames[0]] = new Tensor(inputData, [1, inputData.length]);
        const fetches: Record<string, Tensor> = await session.run(feeds);

        if (!session.outputNames.length) {
            throw new OnnxInferenceError("ONNX session has no output names.");
        }

        const label = fetches[session.outputNames[0]].data[0];
        console.log("Output data:", label);
        if (typeof label !== 'bigint') {
            throw new OnnxInferenceError("Output data is not a bigint.");
        }
        const isRedDay: Boolean = Number(label) === 1;
        return isRedDay;
    } catch (error) {
        console.error("Error loading or running ONNX model:", error);
        return false
    }
};
