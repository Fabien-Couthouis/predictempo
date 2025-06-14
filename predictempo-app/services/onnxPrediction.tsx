import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { Asset } from 'expo-asset';
import { retrieveWeatherPredictions, FetchWeatherError } from './weatherForecastRetriever';
import { isThereOneRedDayLastWeek } from './redDaysRetriever';

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
        throw new OnnxModelNotFoundError(`Failed to get model at: ${assets[0]}`);
    }

    return InferenceSession.create(modelUri, { executionProviders: ['cpu'] });
}

const retrieveInputData = async (nDaysToPredict: number, inputNames: readonly string[]) => {
    const cities = new Set<string>();
    const inputData: Record<string, Number[]> = {};

    inputNames.forEach((inputName) => {
        if (inputName.startsWith('TN_') || inputName.startsWith('TX_')) {
            cities.add(inputName.slice(3).toUpperCase());
        }

        inputData[inputName] = [];
    });

    console.log("Retrieving weather for cities:", cities);
    const weatherPredictions = await retrieveWeatherPredictions(Array.from(cities), nDaysToPredict);
    if (!weatherPredictions) {
        throw new FetchWeatherError(`Failed to fetch weather data for ${cities}`);
    }

    weatherPredictions.forEach(cityPrediction => {
        cityPrediction.dailyPredictions.forEach(dailyPrediction => {
            const tn = dailyPrediction.temperature2mMin;
            const tx = dailyPrediction.temperature2mMax;

            inputData[`TN_${cityPrediction.city}`].push(tn);
            inputData[`TX_${cityPrediction.city}`].push(tx);
        });
    });

    const today = new Date();
    const redDaysLastWeek = await isThereOneRedDayLastWeek(today);
    console.log("Red days last week:", redDaysLastWeek);

    for (let i = 1; i <= nDaysToPredict; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayIdx = date.getDay();

        const isWeekDay = (dayIdx >= 1) && (dayIdx <= 5);

        inputData[`is_week_day`].push(isWeekDay ? 1.0 : 0.0);
        inputData[`red_days_last_week`].push(redDaysLastWeek ? 1.0 : 0.0);
    }

    // Convert to tensor
    const inputDataTensor: Record<string, Tensor> = {};
    Object.keys(inputData).forEach((key) => {
        inputDataTensor[key] = new Tensor("float32", inputData[key].map(Number), [inputData[key].length, 1]);
    });
    return inputDataTensor;
}

// Cache object to store predictions
const predictionCache: Record<string, boolean[]> = {};

export const areRedDays = async (nDaysToPredict: number): Promise<boolean[]> => {
    const cacheKey = nDaysToPredict.toString();
    if (predictionCache[cacheKey]) {
        return predictionCache[cacheKey];
    }

    try {
        const modelPath = '../assets/neural_networks/lgbm_model_red_days_2025_03_12.onnx';
        let session = await loadModelAssetAndCreateSession(require(modelPath));
        const inputData = await retrieveInputData(nDaysToPredict, session.inputNames);

        // Run inference
        const fetches: Record<string, Tensor> = await session.run(inputData);

        if (!session.outputNames.length) {
            throw new OnnxInferenceError("ONNX session has no output names.");
        }

        const areRedDay: boolean[] = [];
        for (let i = 0; i < nDaysToPredict; i++) {
            const label = fetches[session.outputNames[0]].data[i];
            if (typeof label !== 'bigint') {
                throw new OnnxInferenceError("Output data is not a bigint.");
            }

            areRedDay.push(Number(label) === 1);
        }

        predictionCache[cacheKey] = areRedDay;
        console.log("Are red days result:", areRedDay);
        return areRedDay;
    } catch (error) {
        console.error("Error loading or running ONNX model:", error);
        const defaultResult = Array(nDaysToPredict).fill(false);
        // set in cache so we don't keep trying requesting the API
        predictionCache[cacheKey] = defaultResult;
        return defaultResult;
    }
};
