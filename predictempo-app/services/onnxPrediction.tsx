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
        // warning: months are 0-indexed in JS, unlike in Pandas code used for training
        inputData[`month`].push(date.getMonth() + 1.0); 
    }

    // Convert to tensor
    const inputDataTensor: Record<string, Tensor> = {};
    Object.keys(inputData).forEach((key) => {
        inputDataTensor[key] = new Tensor("float32", inputData[key].map(Number), [inputData[key].length, 1]);
    });
    return inputDataTensor;
}

interface Prediction {
    label: boolean;
    probability: number;
}

// Cache object to store predictions
const predictionCache: Record<string, Prediction[]> = {};
export const areRedDays = async (nDaysToPredict: number): Promise<Prediction[]> => {
    const cacheKey = nDaysToPredict.toString();
    if (predictionCache[cacheKey]) {
        return predictionCache[cacheKey];
    }

    try {
        const modelPath = '../assets/neural_networks/lgbm_model_red_days_2026_01_14.onnx';
        let session = await loadModelAssetAndCreateSession(require(modelPath));
        const inputData = await retrieveInputData(nDaysToPredict, session.inputNames);

        // Run inference
        const fetches: Record<string, Tensor> = await session.run(inputData);

        if (session.outputNames.length === 0) {
            throw new OnnxInferenceError("ONNX session has no output names.");
        }
        console.log("ONNX output names:", session.outputNames);
        console.log("ONNX outputs:", fetches[session.outputNames[1]].data);

        const predictions: Prediction[] = [];
        const labels = fetches[session.outputNames[0]].data;
        // array of probabilities for each class (0 and 1), flattened
        const probs = fetches[session.outputNames[1]].data;
        for (let i = 0; i < nDaysToPredict; i++) {
            const label = labels[i];
            const prob = probs[i * 2 + 1]; // probability of class 1 (red day)
            if (typeof label !== 'bigint') {
                throw new OnnxInferenceError("Output data is not a bigint.");
            }

            predictions.push({
                label: Number(label) === 1,
                probability: prob,
            });
            console.log(`Day ${i + 1}: label=${label}, prob=${prob}`);
        }

        predictionCache[cacheKey] = predictions;
        console.log("Predictions result:", predictions);
        return predictions;
    } catch (error) {
        console.error("Error loading or running ONNX model:", error);
        const defaultResult: Prediction[] = Array(nDaysToPredict).fill({ label: false, probability: 0 });
        // set in cache so we don't keep trying requesting the API
        predictionCache[cacheKey] = defaultResult;
        return defaultResult;
    }
};