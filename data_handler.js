const PubNub = require('pubnub');
let request = require("request");
let terms = require('./common_terms.js');

const SUBSCRIBE_KEY = 'sub-c-5f1b7c8e-fbee-11e3-aa40-02ee2ddab7fe';

const PUBNUM_CHANNEL_NAME = 'pubnub-sensor-network';
const INSERT_OPERATION = 'insert';
const SCHEMA_NAME = 'iot_data';
const TABLE_NAME = 'message';

module.exports = {
    subscribe: subscribe
};

function subscribe(socket) {
    pubnub = new PubNub({
        subscribeKey : SUBSCRIBE_KEY
    });

    pubnub.addListener({
        message: function(message) {

            // lets extract useful parts from pubnub message before inserting into hdb.
            let hdb_message = message.message;
            hdb_message.timetoken = message.timetoken;

            // lets send the data to HarperDB
            let options = { method: terms.POST_METHOD,
                url: terms.HARPER_URL,
                headers:
                    {
                        authorization: terms.AUTH_TOKEN,
                        'content-type' : terms.CONTENT_HEADER
                    },
                body:
                    { operation: INSERT_OPERATION,
                        schema: SCHEMA_NAME,
                        table: TABLE_NAME,
                        records:
                            [ hdb_message ]
                    },
                json: true };

            request(options, function (error, response, body) {
                if (error) {
                    console.error(error);
                }
            });

            // now lets use socket.io to update our page
            socket.emit(terms.SOCKET_UPDATE_MESSAGE_NAME, message );
        }
    })
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: [PUBNUM_CHANNEL_NAME]
    });
};
