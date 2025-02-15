
import { Asset } from "expo-asset";
import {Tensor, InferenceSession, env} from 'onnxruntime-web';
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export const isRedDay = async (date: Date) => {
  try {
    console.log("Loading ONNX model from assets...");

    // Step 1: Resolve the asset URI
    const asset = Asset.fromModule(require("assets/neural_networks/lgbm_model_red_days_2025_02_10.onnx"));

    if (!asset.localUri) {
      await asset.downloadAsync(); // Ensure the asset is available
    }

    // Step 2: Fetch the model as a Blob
    const response = await fetch(asset.uri);
    if (!response.ok) {
      throw new Error(`Failed to load ONNX model: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();

    // Step 3: Convert Blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Step 5: Create an ONNX inference session

    const session = await InferenceSession.create(arrayBuffer, {
      executionProviders: ["cpu"], // Change to ["wasm"] if needed
    });

    console.log("ONNX Model loaded successfully!");
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
  return true
};
