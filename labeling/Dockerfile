FROM jjanzic/docker-python3-opencv
WORKDIR /code
COPY requirements.txt .
RUN apt-get update \
    && apt-get install -y libsm6 libxext6 libxrender-dev \
    && wget --header="Host: awma1-my.sharepoint.com" --header="User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36" --header="Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9" --header="Accept-Language: en-US,en;q=0.9" --header="Referer: https://awma1-my.sharepoint.com/personal/yuz_l0_tn/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fyuz%5Fl0%5Ftn%2FDocuments%2Fshare%2Fbua%2Dpytorch%2Fckpts%2Fbua%2Dcaffe%2Dfrcn%2Dr101%5Fwith%5Fattributes%2Epth&parent=%2Fpersonal%2Fyuz%5Fl0%5Ftn%2FDocuments%2Fshare%2Fbua%2Dpytorch%2Fckpts&originalPath=aHR0cHM6Ly9hd21hMS1teS5zaGFyZXBvaW50LmNvbS86dTovZy9wZXJzb25hbC95dXpfbDBfdG4vRWFYdkNDM1dqdGxMdnZFZkxyM29hOFVCTEEyMXRjTGg0TDhZTGJZWGw2amdqZz9ydGltZT0xX1IwbWNlcjJFZw" --header="Cookie: FedAuth=77u/PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48U1A+VjgsMGguZnxtZW1iZXJzaGlwfHVybiUzYXNwbyUzYWFub24jNzU1MzNmOGUyMzU1YTJlMDg0MGU2YjJlMTI4MjM0MTQwN2NiYmM2MTdjOWNhMGY3OThlZjdmNzg0OWY0YTlhYywwIy5mfG1lbWJlcnNoaXB8dXJuJTNhc3BvJTNhYW5vbiM3NTUzM2Y4ZTIzNTVhMmUwODQwZTZiMmUxMjgyMzQxNDA3Y2JiYzYxN2M5Y2EwZjc5OGVmN2Y3ODQ5ZjRhOWFjLDEzMjUzNjk4NzM3MDAwMDAwMCwwLDEzMjUzNzg0ODM4MDI2ODk4OSwwLjAuMC4wLDI1OCxlYTE4YjdmYi01ODJjLTQ5MzgtOTM5My00ZTE5NDllZGUwZTEsLCwzM2Y3OWI5Zi0xMDI3LTAwMDAtNWQ1Mi1lOGFiZmMzZDI5MDgsMzNmNzliOWYtMTAyNy0wMDAwLTVkNTItZThhYmZjM2QyOTA4LFAvdW9YNjBwSzBxZWN4NEVra0E3OUEsMCwwLDAsLCwsMjY1MDQ2Nzc0Mzk5OTk5OTk5OSwwLCxFRWdYbTN4TnhnOFlzTXdKYmg3b3kwOFpmaDFlQnVCeW5zQU1WbWdxdkZuVVBYSlR1S2g3YlFrRFMrSVMwRmRmOVRhTjdOdFBnYVhnVE9kYiswRFE2cmtzQ0ljVXc3eXNIMk9rM2FLcVR0bEV6QXZ5dWJSRnFZS1N3SEpDZ1ZwTEpUQy91WEJzNEtFdGNTOXFiZC9uaHp6WW5rQUlHRllsVGk1aEoxU1hWNFZYOXI1VlRnN0Z6UnFXa1AxWUhJSXdJQ2VjK0M2SUduT3F0RjBXQTVGc01wbXpKeUVWR2VST1gwalRQNm13Q1B1YnMyamVsU04xem9QWFFTVmhkeWdVNFdrS3dVdTRYeCs4VVVDMklQZnV5VnFZMzZKTU5XYndISVVaQllpTUpTdUxrMXdoTnVONGNZWUhDNWEzVFV4S0RscWdmZXNpU01jYkVwNlFnUVdNWmc9PTwvU1A+; WSS_FullScreenMode=false" --header="Connection: keep-alive" "https://awma1-my.sharepoint.com/personal/yuz_l0_tn/_layouts/15/download.aspx?SourceUrl=%2Fpersonal%2Fyuz%5Fl0%5Ftn%2FDocuments%2Fshare%2Fbua%2Dpytorch%2Fckpts%2Fbua%2Dcaffe%2Dfrcn%2Dr101%5Fwith%5Fattributes%2Epth" -c -O 'bua-caffe-frcn-r101_with_attributes.pth' \
    && pip install -r requirements.txt \
    && pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html \
    && git clone https://github.com/NVIDIA/apex.git \
    && cd apex \
    && git checkout a0d99fdb2cfcc418809dde975f51097c3d6010ca \
    && python setup.py install \
    && cd .. \
    && git clone --recursive https://github.com/MILVLG/bottom-up-attention.pytorch \
    && cd bottom-up-attention.pytorch/detectron2 \
    && pip install -e . \
    && cd .. \
    && python setup.py build develop
COPY src/ .
CMD [ "python", "./app.py" ]