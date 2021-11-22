FROM jjanzic/docker-python3-opencv
WORKDIR /code
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html 
RUN pip install ftfy regex tqdm
RUN pip install git+https://github.com/openai/CLIP.git
COPY search.py .
CMD [ "python", "-u", "./search.py" ]