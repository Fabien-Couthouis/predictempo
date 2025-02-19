import {InferenceSession, Tensor} from 'onnxruntime-react-native';
import { useEffect, useState } from "react";
import RNFS from 'react-native-fs';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';

export const isRedDay = async (date: Date) => {
    try {
        // const modelAssetPath = "assets/lgbm_model_red_days_2025_02_10.onnx";
        const assets = await Asset.loadAsync(require('../assets/neural_networks/lgbm_model_red_days_2025_02_10.onnx'));
        const modelUri = assets[0].localUri;
        if (!modelUri) {
            Alert.alert('failed to get model URI', `${assets[0]}`);
        } else {
            let model = await InferenceSession.create(modelUri);
            Alert.alert(
            'model loaded successfully',
            `input names: ${model.inputNames}, output names: ${model.outputNames}}`
            );
        }

    // console.log("Loading ONNX model from:", modelAssetPath);
    // RNFS.readFileAssets(modelAssetPath, "base64") // 'base64' for binary 
    // .then(binary => {
    //     // work with it
    //     console.log('file read successfully', binary)
    // })
    // .catch(console.error)


    // const modelFilePath = `${RNFS.DocumentDirectoryPath}/lgbm_model_red_days_2025_02_10.onnx`;
    // await RNFS.copyFileAssets(modelAssetPath, modelFilePath);

    // const session: InferenceSession = await InferenceSession.create(modelFilePath)
    const inputData = new Float32Array(20).fill(0); 
    const inputTensor = new Tensor("float32", inputData, [1, inputData.length]);

    // // Run inference
    // const outputs = await session.run({ input: inputTensor });

    // const session = await InferenceSession.create(arrayBuffer, {
    //   executionProviders: ["cpu"], // Change to ["wasm"] if needed
    // });

    // console.log("ONNX Model loaded successfully!");
    // // Step 5: Prepare Input Data (Modify according to your model)
    // const inputTensor = new ort.Tensor("float32", new Float32Array([1, 2, 3, 4]), [1, 4]);
    // const feeds = { input: inputTensor };

    // // Step 6: Run Model
    // const results = await session.run(feeds);
    // console.log("Model Output:", results.output.data);

    return true;
  } catch (error) {
    console.error("Error loading or running ONNX model:", error);
    return false
  }
};
