from flask import Flask, render_template, request, redirect, url_for, jsonify
import numpy as np
import pandas as pd
import pickle

app = Flask(__name__)




mapping = {np.int64(0): 'apple', np.int64(1): 'banana', np.int64(2): 'blackgram', np.int64(3): 'chickpea', np.int64(4): 'coconut', np.int64(5): 'coffee', np.int64(6): 'cotton', np.int64(7): 'grapes', np.int64(8): 'jute', np.int64(9): 'kidneybeans', np.int64(10): 'lentil', np.int64(11): 'maize', np.int64(12): 'mango', np.int64(13): 'mothbeans', np.int64(14): 'mungbean', np.int64(15): 'muskmelon', np.int64(16): 'orange', np.int64(17): 'papaya', np.int64(18): 'pigeonpeas', np.int64(19): 'pomegranate', np.int64(20): 'rice', np.int64(21): 'watermelon'}


@app.route('/jsonrec', methods=['GET', 'POST'])
def predict():
    if request.method == 'GET':
        try:
            n = float(request.args.get('N'))
            p = float(request.args.get('P'))
            k = float(request.args.get('K'))
            temp = float(request.args.get('temperature'))
            hum = float(request.args.get('humidity'))
            rain = float(request.args.get('rainfall'))

            input_data = [[n, p, k, temp, hum, rain]]

            with open('model.pkl', 'rb') as f:
                model = pickle.load(f)

            pred = model.predict(input_data)[0]
            crop = mapping[np.int64(pred)] 

            return jsonify({'predicted_crop': crop})

        except Exception as e:
            return jsonify({'error': str(e)}), 400

    elif request.method == 'POST':
        try:
            data = request.get_json()
            n = float(data['N'])
            p = float(data['P'])
            k = float(data['K'])
            temp = float(data['temperature'])
            hum = float(data['humidity'])
            rain = float(data['rainfall'])

            input_data = [[n, p, k, temp, hum, rain]]

            with open('model.pkl', 'rb') as f:
                model = pickle.load(f)

            pred = model.predict(input_data)[0]
            crop = mapping[np.int64(pred)]

            return jsonify({'predicted_crop': crop})

        except Exception as e:
            return jsonify({'error': str(e)}), 400


if  __name__ == '__main__':
    app.run(debug=True)
