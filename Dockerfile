FROM hoist/core-box:1.8

USER root
#copy npmrc to enable login to private npm
COPY .npmrc /home/hoist/.npmrc

RUN chown hoist:hoist /home/hoist/.npmrc

USER hoist

ENV CONNECTOR_NAME=wordpress

#npm install
ADD package.json /usr/src/app/package.json
RUN npm install

RUN rm /home/hoist/.npmrc

#add source and ensure it's owned by the hoist user
USER root
ADD . /usr/src/app
RUN chown -R hoist:hoist /usr/src/app
USER hoist

RUN gulp transpile

#start the deploy script
CMD [ "./deploy.sh"]
