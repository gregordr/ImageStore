import numpy as np
from PIL import Image
import yaml
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions, MobileNetV2

class ImageClassifier:
    def __init__(self, rule_path):
        self._model = MobileNetV2(weights='imagenet')
        with open(rule_path) as file:
            self._rules = yaml.full_load(file)


    def predict(self, image):
        x = image.resize((224, 224), Image.ANTIALIAS)
        x = np.array(x)
        x = x[np.newaxis, :]
        x = preprocess_input(x)
        preds = self._model.predict(x)
        decoded = decode_predictions(preds, top=5)[0]
        return self._get_labels(decoded)

    def _get_labels(self, predictions):
        labels = set()

        for pred in predictions:
            name = pred[1].replace('_', ' ').lower().strip()
            if name in self._rules:
                rule = self._rules[name]

                if 'see' in rule:
                    if rule['see'] != 'ignore':
                        labels.add(rule['see'])
                elif pred[2] > rule['threshold']:
                    if 'label' in rule:
                        labels.add(rule['label'])
                    else:
                        labels.add(name)
                    
                    if 'categories' in rule:
                        labels.update(rule['categories'])

        labels.update(self._get_all_categories(labels))
        return list(labels)


    def _get_all_categories(self, categories):
        output = set()

        for name in categories:
            if name in self._rules and 'categories' in self._rules[name]:
                output.update(self._rules[name]['categories'])
                output.update(self._get_all_categories(self._rules[name]['categories']))

        return output



