from typing import List, Set
import os
from flask import Flask, json, request
import torch
import clip
from PIL import Image
import requests
from io import BytesIO
from waitress import serve
from dotenv import load_dotenv
import threading, queue
from PIL import ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

load_dotenv()
PORT = os.getenv("PORT")
BACKEND = os.getenv("BASE_ADDRESS")

api = Flask(__name__)


device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

featureDirectory = "features/" 

obj = {}

processQueue = queue.Queue()

def getPhoto(imgId, thumb = False):
    response = requests.get("http://" + BACKEND + "/media/" + ("thumb_" if thumb else "") + imgId )
    image = preprocess(Image.open(BytesIO(response.content))).unsqueeze(0).to(device)
    image_features = model.encode_image(image)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    torch.save(image_features, featureDirectory+ imgId)

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

            obj[imgId] = torch.load(featureDirectory+ imgId)[0]

        except Exception as e:
            print(f"Loading {imgId} failed because of {e}") 

    # remove unused
    for file in files:
        if not file in usedSet:
            os.unlink("features/"+file)
    
def findByText(term, candidates: List[str]):
    text = clip.tokenize([term,  ""]).to(device)
    text_features = model.encode_text(text)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    usedCandidates = list()

    tmp = []
    for x in candidates:
        if(not x in obj):
            continue
        
        usedCandidates.append(x)
        tmp.append(obj[x])

    if len(tmp) == 0:
        return []

    tmp = torch.stack(tmp)
    scores = (tmp @ text_features.t()).t()
    #scores = torch.div(scores[0],1)
    scores = torch.div(scores[0],scores[1])

    accepted = torch.sort(scores)
    ind = torch.searchsorted(accepted.values, torch.tensor(1.1))

    res = accepted.indices[ind.item():].tolist()
    res.reverse()

    return [usedCandidates[x] for x in res]

    
def findByImage(term, candidates: List[str]):
    target_features = torch.squeeze(obj[term])

    usedCandidates = list()

    tmp = []
    for x in candidates:
        if(not x in obj):
            continue
        
        usedCandidates.append(x)
        tmp.append(obj[x])

    if len(tmp) == 0:
        return []

    tmp = torch.stack(tmp)
    scores = (tmp @ target_features).t()


    accepted = torch.sort(scores)
    ind = torch.searchsorted(accepted.values, torch.tensor(0.65))

    res = accepted.indices[ind.item():].tolist()
    res.reverse()

    return [usedCandidates[x] for x in res]


@api.route('/searchByText', methods=['POST'])
def searchByText():
    jsonData = request.get_json()
    
    text = jsonData["text"]
    candidates = jsonData["candidates"]

    return json.dumps(findByText(text, candidates))

@api.route('/searchByImage', methods=['POST'])
def searchByImage():
    jsonData = request.get_json()
    
    image = jsonData["image"]
    candidates = jsonData["candidates"]

    return json.dumps(findByImage(image, candidates))

def worker():
    while True:
        imgId, thumb = processQueue.get()

        try:
            getPhoto(imgId, thumb=thumb)

            obj[imgId] = torch.load(featureDirectory+ imgId)[0]

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
    requests.post("http://" + BACKEND + "/services/register", json = {"names": ["upload", "search"], "port": PORT})


if __name__ == '__main__':
    print("Processing all photos")
    getAllPhotos()
    print("Search starting")
    threading.Thread(target=worker, daemon=True).start()
    register()
    serve(api, listen='*:' + PORT)