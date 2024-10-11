FROM node:latest

WORKDIR /test

COPY package*.json /test/

RUN npm install

COPY . /test/

RUN tar -xvzf /test/ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin

RUN rm /test/ngrok-v3-stable-linux-amd64.tgz

EXPOSE 9000

ENV NGROK_AUTHTOKEN=2nIm6H0oTTxvDpcUA1DCLNWxvRM_gfPUf6Dx2ZQGLiaPkwvM

# COPY entrypoint.sh /test/entrypoint.sh

RUN chmod +x /test/entrypoint.sh

CMD [ "/test/entrypoint.sh" ]