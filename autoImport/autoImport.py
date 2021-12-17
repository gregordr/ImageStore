from typing import List, Set
import os
import requests
from dotenv import load_dotenv
import time

load_dotenv()
SLEEP_TIME = int(os.getenv("SLEEP_TIME", "100"))
POLLING_RATE = int(os.getenv("POLLING_RATE", "10000"))
BACKEND_URL = os.getenv("BACKEND_URL")

importPath = "import/import"
rejectedPath = "import/rejected"

os.makedirs(rejectedPath, exist_ok=True)
os.makedirs(importPath, exist_ok=True)

def upload(file):
    with open(os.path.join(importPath, file), 'rb') as f:
        res = requests.post("http://" + BACKEND_URL + "/media/add", data={"date": str(1000*int(os.path.getmtime(os.path.join(importPath, file))))}, files={"file": f})
        if res.text.startswith("{\"success\":[]"):
            raise Exception(res.text)

def processFiles():
    files = os.listdir(importPath)
    for file in files:
        time.sleep(SLEEP_TIME/1000)
        try:
            upload(file)
            os.unlink(os.path.join(importPath, file))
        except Exception  as e:
            print(e)
            os.rename(os.path.join(importPath, file), os.path.join(rejectedPath, file))


while True:
    time.sleep(POLLING_RATE/1000)
    processFiles()