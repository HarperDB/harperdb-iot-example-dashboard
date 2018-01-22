var express = require('express');
var PubNub = require('pubnub')

function subscribe(socket) {

    pubnub = new PubNub({
        subscribeKey : 'sub-c-5f1b7c8e-fbee-11e3-aa40-02ee2ddab7fe'
    })


    pubnub.addListener({
        message: function(message) {
           // console.log(message);
            var request = require("request");
            // lets extract useful parts from pubnub message before inserting into hdb.
            var hdb_message = message.message;
            hdb_message.timetoken = message.timetoken;


            // lets send the data to HarperDB
            var options = { method: 'POST',
                url: 'http://localhost:9925/',
                headers:
                    {
                        authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk',
                        'content-type': 'application/json' },
                body:
                    { operation: 'insert',
                        schema: 'iot_data',
                        table: 'message',
                        records:
                            [ hdb_message ] },
                json: true };

            request(options, function (error, response, body) {
                if (error) {
                    console.error(error);

                }
                //console.log(body);
            });


            // now lets use socket.io to update our page
            socket.emit('update-msg', message );


        }
    })
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['pubnub-sensor-network']
    });
};


module.exports = {
    subscribe: subscribe
}
