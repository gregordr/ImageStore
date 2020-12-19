import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions, MobileNetV2

class ImageClassifier:
    def __init__(self):
        self._model = MobileNetV2(weights='imagenet')

    def predict(self, image):
        x = image.resize((224, 224), Image.ANTIALIAS)
        x = np.array(x)
        x = x[np.newaxis, :]
        x = preprocess_input(x)
        preds = self._model.predict(x)
        decoded = decode_predictions(preds, top=5)[0]
        return [i[1] for i in decoded]