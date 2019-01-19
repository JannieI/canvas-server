// This routine takes input, and creates a Return object in CanvasHttpResponse format.
// TODO - add the Database name as well
module.exports = function createReturnObject(
    inputStatusCode, 
    inputReturnMessage, 
    inputDataObject,
    inputServerName,
    inputServerType,
    inputDatabaseName,
    inputTableName,
    inputNrRecordsReturned,
    inputMetadataFields,
    inputToken) {

    // Define vars
    let statusCode = 'success';
    if (inputStatusCode != null) {
        statusCode = inputStatusCode;
    };
    let returnMessage = 'An Error occured';
    if (inputReturnMessage != null) {
        returnMessage = inputReturnMessage;
    };
    let dataObject = {};
    if (inputDataObject != null) {
        dataObject = inputDataObject;
    };
    let serverName = '';
    if (inputServerName != null) {
        serverName = inputServerName;
    };
    let serverType = '';
    if (inputServerType != null) {
        serverType = inputServerType;
    };
    let databaseName = '';
    if (inputDatabaseName != null) {
        databaseName = inputDatabaseName;
    };
    let tableName = {};
    if (inputTableName != null) {
        tableName = inputTableName;
    };
    let nrRecordsReturned = {};
    if (inputNrRecordsReturned != null) {
        nrRecordsReturned = inputNrRecordsReturned;
    };
    let metadataFields = {};
    if (inputMetadataFields != null) {
        metadataFields = inputMetadataFields;
    };
    let token = "";
    if (inputToken != null) {
        token = inputToken;
    };
    

    // Return an object in CanvasHttpResponse format
    return {
        "statusCode": statusCode,
        "message" : returnMessage,
        "data": dataObject,
        "metaData": {
            "server": 
                {
                    "serverName": serverName,
                    "serverType": serverType
                },
                
            "database": 
                {
                    "databaseName": databaseName
                },
            "table": 
                {
                    "tableName": tableName,
                    "nrRecordsReturned": nrRecordsReturned
                },
            "fields": metadataFields
        },
        "error": null,
        "token": token
    };

}

