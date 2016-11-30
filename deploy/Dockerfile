# deploy/Dockerfile
# Dockerfile for your app.
# Change "vinmonopolet2" in the Dockerfile to your app's name
FROM node:0.10
MAINTAINER HÃkon Osland <hakon.osland.ettestol@gmail.com>
RUN apt-get install -y curl
RUN curl https://install.meteor.com/ | /bin/sh
# Change "vinmonopolet2" to your app's name 
ADD . /opt/vinmonopolet2/app
# Install NPM packages
WORKDIR /opt/vinmonopolet2/app/programs/server
RUN npm install
# Set environment variables 
WORKDIR /opt/budgeter/app
ENV PORT 80
ENV ROOT_URL http://127.0.0.1
ENV MONGO_URL mongodb://mongo_instance:27017/vinmonopolet2
# Expose port 80
EXPOSE 80
# Start the app
CMD node ./main.js
