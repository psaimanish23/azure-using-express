#!/bin/bash

# Start your Node.js server in the background
npm run start &

# # Start ngrok
ngrok config add-authtoken $NGROK_AUTHTOKEN
ngrok http --domain=smiling-refined-lionfish.ngrok-free.app 9000