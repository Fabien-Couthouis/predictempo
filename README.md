# PredicTempo

Mobile app that aims to predict next EDF red days in the 'Tempo' offer.

<img src="docs/images/predictempo-demo.jpg" alt="drawing" height="420" style="text-align:center"/>
<br>
<br>

[EDF](https://www.edf.fr/)’s (French electricity provider) "[Tempo](https://particulier.edf.fr/fr/accueil/gestion-contrat/options/tempo/details.html)" contract offers variable electricity pricing based on the day’s color: 300 blue (cheap), 43 white (moderate), and 22 red (expensive) days per year, with red days occurring only during winter. While this helped reduce my electricity bill, EDF only reveals the next day’s color at 11 a.m., making it difficult to plan energy-intensive tasks (cooking, laundry, etc.) in advance.

As a machine learning engineer, I set out to predict red days up to 5 days ahead using weather forecasts. I scraped historical weather data from Météo-France (2016–2024) and Tempo day history from EDF, engineered relevant features, and trained a boosted tree model for binary classification. I exported the model to ONNX format and deployed it in a React Native mobile app I developed, allowing me to easily check predictions on my Android phone.

This project blends real-world energy concerns with end-to-end machine learning: data collection, feature engineering, modeling, and mobile deployment, and provides a practical tool for smarter energy use and savings!


