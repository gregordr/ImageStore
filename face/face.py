import os
import threading, queue
import traceback
from typing import List
from flask import Flask, json, request
import torch
import requests
from waitress import serve
from dotenv import load_dotenv
import cv2
import numpy as np

from insightface.app import FaceAnalysis
app = FaceAnalysis(name='antelopev2')
app.prepare(ctx_id=0, det_size=(640, 640))

load_dotenv()
PORT = os.getenv("PORT")
BACKEND = os.getenv("BASE_ADDRESS")

api = Flask(__name__)

featureDirectory = "features/" 

obj = {}

processQueue = queue.Queue()

def getPhoto(imgId, thumb = False):
    response = requests.get("http://" + BACKEND + "/media/" + ("thumb_" if thumb else "") + imgId, stream=True).raw
    image = np.asarray(bytearray(response.read()), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    faces = app.get(image)

    boxes = [face.bbox for face in faces]
    embeddings = [torch.tensor(np.concatenate((face.bbox, face.normed_embedding))) for face in faces]

    requests.post("http://" + BACKEND + "/face/add", json={"id": imgId, "boxes": [",".join([str(element) for element in box]) for box in boxes]} )

    if len(embeddings) == 0:
        embeddings = [torch.zeros(0)]
    embeddings = torch.stack(embeddings)
    torch.save(embeddings, featureDirectory+imgId)

def getAllPhotos():
    os.makedirs("features/", exist_ok=True)
    files = dict.fromkeys(os.listdir("features/"))
    response = requests.get("http://" + BACKEND + "/media/all")

    usedSet = set()
    for img in response.json():
        imgId = img["id"]
        usedSet.add(imgId)
        try:
            if not imgId in files:
                getPhoto(imgId, thumb = img["type"] != "photo")
            obj[imgId] = torch.load(featureDirectory+imgId)
        except Exception as e:
            print(f"Loading {imgId} failed because of {e}")
            traceback.print_exc()

    # remove unused
    for file in files:
        if not file in usedSet:
            os.unlink("features/"+file)

def dist(box: str, array):
    numbers = [int(x) for x in box.replace("(", "").replace(")", "").split(", ")]
    return np.abs(numbers[0] - array[2])+ np.abs(numbers[1] - array[3])+ np.abs(numbers[2] - array[0])+ np.abs(numbers[3] - array[1])
    
def findByImage(term, candidates: List[str]):
    target_features = [x for x in obj[term.split("||")[0]] if dist(term.split("||")[1], x[:4]) < 5]

    if(len(target_features) == 0):
        return []

    target_features = target_features[0][4:]

    usedCandidates = list()

    tmp = []
    for x in candidates:
        if(not x in obj):
            continue
        
        for tensor in obj[x]:
            if(tensor.shape[0] <= 1):
                continue
            usedCandidates.append(x)
            tmp.append(tensor[4:])

    if len(tmp) == 0:
        return []

    tmp = torch.stack(tmp)
    scores = (tmp @ target_features).t()

    accepted = torch.sort(scores)
    ind = torch.searchsorted(accepted.values, torch.tensor(0.35))

    res = accepted.indices[ind.item():].tolist()
    res.reverse()

    return [usedCandidates[x] for x in res]

@api.route('/searchByFace', methods=['POST'])
def searchByFace():
    jsonData = request.get_json()
    
    image = jsonData["image"]
    candidates = jsonData["candidates"]

    return json.dumps(findByImage(image, candidates))

def worker():
    while True:
        imgId, thumb = processQueue.get()

        try:
            getPhoto(imgId, thumb=thumb)
            obj[imgId] = torch.load(featureDirectory+imgId)

        except Exception as e:
            print(f"Loading {imgId} failed because of {e}") 

        processQueue.task_done()


@api.route("/upload", methods=["POST"])
def callback():
    jsonData = request.get_json()

    for imgId, imgType in zip(jsonData["oids"], jsonData["types"]):
        processQueue.put((imgId, imgType != "photo"))

    return json.dumps(True)


def register():
    requests.post("http://" + BACKEND + "/services/register", json = {"names": ["upload", "face"], "port": PORT})


if __name__ == '__main__':
    print("Processing all photos")
    getAllPhotos()
    print("Faces starting")
    threading.Thread(target=worker, daemon=True).start()
    register()
    serve(api, listen='*:' + PORT)
