// Router for All Client data, ie XIS Trades, Sales History, etc

// Imports
const express = require('express');
const router = express.Router();
const debugData = require('debug')('app:data');
const debugDev = require('debug')('app:dev');
const datalayer = require('../databaseConnectors/mysql.datalayer');

// Runs for ALL requests
router.use('/', (req, res, next) => {

    // Validate id of clientData provided
    const id = req.query.id;
    debugData('query is ', id);

	if (id == null) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No id provided in query string",
            "data": null,
            "error": "No id provided in query string"
        });
    };

	if (isNaN(id)) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "id parameter must be a number",
            "data": null,
            "error": "id parameter must be a number"
        });
    };

    // Continue
    next();
})

// GET route
router.get('/', (req, res, next) => {

    // The structure of this route is as follows:
    // 1. Preparation: 
    //    1.1 Get the datasourceID from req.query
    //    1.2 Get the DS (Datasource) record for the given datasourceID in req.query.  
    //    1.3 Get auxilliary information, like Tr (Transformations), 
    //        dSet (datasets).
    // 2. Set results = [] (data block to return to Workstation)
    // 3. Get the data - either cached or from source:
    // 4. Do the Transformations according to the Tr loaded in step 1
    // 5. Decompose the query string in req.query into SORT_OBJECT, FIELDS_STRING, FILTER_OBJECT, 
    //    AGGREGATION_OBJECT
    // 6. If (SORT_OBJECT) then results = results.sort()
    // 7. If (FIELDS_STRING) then results = results[fields]
    // 8. If (FILTER_OBJECT) then results = results.filter()
    // 9. If (AGGREGATION_OBJECT) then results = results.clever-thing
    // 10. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored), 
    //     with prudent defaults where unknown.
    // 11. Return results according to the CanvasHttpResponse interface
    // 12. If any error, return err according to the CanvasHttpResponse interface

    // 1. Preparation: 
    //    1.1 Get the datasourceID from req.query
    const reqQuery = req.query;
    const id = req.query.id;
    const datasourceID = req.query.datasourceID;
    
    //    1.2 Get the DS (Datasource) record for the given datasourceID in req.query.  
    const datasourceSchema = '../models/datasources.model';
    const datasourceModel = require(datasourceSchema);
    const mongoQuery = { id: datasourceID };
    
    datasourceModel.find( mongoQuery, (err, datasourceArray) => {
        if (err) {
            console.error('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Error finding Datasource in Mongo DB",
                "data": null,
                "error": err
            });
            return;
        };
        if (datasourceArray.length != 1) {
            console.error('Error:', err)
            res.json({
                "statusCode": "error",
                "message" : "Expected EXACTLY one Datasource in Mongo DB, not " 
                    + datasourceArray.length + ' for the datasourceID provided:' + datasourceID,
                "data": null,
                "error": err
            });
            return;
        }
 
        // Get the DB-related vars
        const username = datasourceArray[0].username;
        const password = datasourceArray[0].password;
        const databaseName = datasourceArray[0].databaseName;
        const port = datasourceArray[0].port;
        const serverType = datasourceArray[0].serverType;
        const serverName = datasourceArray[0].serverName;
        const dataTableName = datasourceArray[0].dataTableName;
        const dataSQLStatement = datasourceArray[0].dataSQLStatement;
        const cacheResultsOnServer = datasourceArray[0].cacheResultsOnServer;
        const serverExpiryDateTime = datasourceArray[0].serverExpiryDateTime
        const dataFields = datasourceArray[0].dataFields;
        const dataFieldTypes = datasourceArray[0].dataFieldTypes;
        const dataFieldLengths = datasourceArray[0].dataFieldLengths;
        debugDev('Properties read from DS id:', datasourceArray[0].id, username, password, databaseName, port, serverType, serverName, dataTableName, dataSQLStatement, cacheResultsOnServer)
        
        
        //    1.3 Get auxilliary information, like Tr (Transformations), 
        //        dSet (datasets).
        // TODO later ...

        
        // 2. Set results = [] (data block to return to Workstation)
        let results = [];

        // 3. Get the data - either cached or from source:
        let isFresh = false;

        // It is Fresh if not expired as yet
        let dn = new Date();
        let tn = dn.getTime()
        let dl = new Date(serverExpiryDateTime);
        let tl = dl.getTime();
        if (tl >= tn) {
            isFresh = true;
        } else {
            isFresh = false;
        };

        // If cached and isFresh, result = cache
        if (cacheResultsOnServer  &&  isFresh) {
            debugDev(' <- Getting data from Server Disc')

            // Get the model
            const clientSchema = '../models/clientData.model';
            const clientModel = require(clientSchema);
            debugData('Using Schema clientData');

            // Find the data (using the standard query JSON object)
            clientModel.find( { id } , (err, docs) => {

                // Calc how many records are returned
                let nrRecordsReturned = 0;
                if (docs != null) {
                    nrRecordsReturned = docs.length;
                };
                
                // Return the data with metadata
                return res.json({
                    "statusCode": "success",
                    "message" : "Retrieved data for id:" + id,
                    "data": docs[0].data,
                    "metaData": {
                        "table": {
                            "tableName": "", //oneDoc.mongooseCollection.collectionName,
                            "nrRecordsReturned": nrRecordsReturned
                        },
                        "fields": []
                    },
                    "error": null
                });
            });
        } else {

            debugDev(' <- Getting data from Source')
            // Else, get from Source using the correct data-layer-function depending on the DB type (ie MySQL or Mongo).

            // TODO - this must be done with separate routines per serverType
            if (serverType == 'PostgresSQL') {
                // Do thing here
            };
                if (serverType == 'Microsoft SQL') {
                // Do thing here
            };
            if (serverType == 'SQLite') {
                // Do thing here
            };
            if (serverType == 'Oracle') {
                // Do thing here
            };
            if (serverType == 'Mongo') {
                // Do thing here
            };
            
            if (serverType == 'MySQL') {
                datalayer.getFromSource(databaseObject, dataTableName, null, dataSQLStatement, "janniei", )
                    .then(resResultsObject => res.json(resResultsObject) )
                    .catch(resErrorObject  => res.json(resErrorObject) );
            };
            if (serverType == 'MySQL') {
                // Inputs: DATABASE_OBJECT, TABLE, FIELDS, QUERY_STRING, SQL_PARAMETERS
                
                // Create databaseObject
                // Sample: databaseObject = { host: '127.0.0.1', user: 'janniei', password: 'janniei', database: 'mysql'}
                let databaseObject = 
                    { 
                        host: serverName, 
                        user: username, 
                        password: password, 
                        database: databaseName,
                        port: port
                };
                debugDev('About to call mysql.datalayer.select with',databaseObject)

                // Get data useing data layer
                // Example: datalayer.select(databaseObject, dataTableName, null, dataSQLStatement, "janniei", )
                datalayer.select(databaseObject, dataTableName, null, dataSQLStatement, "janniei", )
                    .then(returnedData => {

                        //  Now, results = [data]
                        results = JSON.parse(JSON.stringify(returnedData));

                        // Store the data in Canvas ClientData
                        // Get the model
                        const clientSchema = '../models/clientData.model';
                        const clientModel = require(clientSchema);
                        debugData('Using Schema clientData');

                        // Data to upsert
                        const dataToSave = {
                            id: datasourceID,
                            data: results
                        };

                        // Insert the data into Canvas Server cache (in Mongo)
                        clientModel.updateMany(
                            { id: datasourceID },
                            dataToSave, 
                            { upsert: true }, (err, updateStats) => {

                                if(err){

                                    // Return an error
                                    return res.json({
                                        "statusCode": "error",
                                        "message" : "Error caching data from MySQL on Server",
                                        "data": null,
                                        "error":err.message
                                    });                                    
                                };

                                // TODO - still to be done
                                // 4. Do the Transformations according to the Tr loaded in step 1

                                // 5. Decompose the query string in req.query into SORT_OBJECT, FIELDS_STRING, FILTER_OBJECT, 
                                //    AGGREGATION_OBJECT
                                let sortObject = req.query.sortObject;
                                let fieldsObject = req.query.fields;

                                if (fieldsObject != null) {
                                    fieldsObject = JSON.parse(JSON.stringify(fieldsObject));
                                };
                                let filterObject = req.query.filterObject;
                                const aggregationObject = req.query.aggregationObject;

                                // TODO - if no optional parameters, dont query Mongo - just use results we have

                                // Optional steps:
                                //   6. Sort on SORT_OBJECT
                                //   7. Extract only the requested FIELDS_STRING
                                //   8. Filter on FILTER_OBJECT
                                //   9. Aggregate according to AGGREGATION_OBJECT

                                var query = clientModel.findOne({ id: datasourceID });

                                // TODO: get FILTER and SORT working via Mongo 
                                // if (filterObject != null) {
                                //     query.findOne( { "data.User": {"eq":"root"} } );
                                // };

                                if (fieldsObject != null) {
                                    query.select( fieldsObject );
                                };

                                // TODO - get Mongo sort going
                                // if (sortObject != null) {
                                //     query.sort(sortObject);
                                // };
                                
                                query.exec( (err, finalResults) => {
    
                                    // Set the results, nrRecords while catering for an empty set
                                    results = [];
                                    let nrRecordsReturned = 0;
                                    if (finalResults != null) {
                                        results = finalResults.data;
                                        if (results != null) {
                                            nrRecordsReturned = results.length;
                                        };
                                    };

                                    // Filter Array
                                    // TODO - do this via Mongo
                                    if (filterObject != null  &&  results != null) {
                                        filterObject = JSON.parse(filterObject)
                                        Object.keys(filterObject).forEach( key => {
                                            // Get the key-value pair
                                            let value = filterObject[key];

                                            results = results.filter(r => {
                                                return r[key] == value;                                            
                                            })
                                        });
                                    };

                                    // Sort ASC on given field, -field means DESC
                                    // TODO 
                                    //  - ideally do this via Mongo
                                    //  - else, return sortOrder = 1 depending on - in field, see TypeScript
                                    if (sortObject != null  &&  results != null) {

                                        // DESC, and take off -
                                        if (sortObject[0] === "-") {
                                            sortOrder = 1;
                                            sortObject = sortObject.substr(1);
                                            results.sort( (a,b) => {
                                                if (a[sortObject] > b[sortObject]) {
                                                    return -1;
                                                };
                                                if (a[sortObject] < b[sortObject]) {
                                                    return 1;
                                                };
                                                return 0;
                                            });
                                        } else {
                                            results.sort( (a,b) => {
                                                if (a[sortObject] > b[sortObject]) {
                                                    return 1;
                                                };
                                                if (a[sortObject] < b[sortObject]) {
                                                    return -1;
                                                };
                                                return 0;
                                            });
                                        };
                                    };

                                    // 10. Add metadata, hopefully obtained directly from the source DB, or from the DS (if pre-stored), 
                                    //     with prudent defaults where unknown.

                                    if (dataFields != null) {
                                        if (dataFieldTypes == null) {
                                            dataFieldTypes = [];
                                        };
                                        if (dataFieldLengths == null) {
                                            dataFieldLengths = [];
                                        };
                                        
                                        var fields = [];

                                        // Loop on metatdata
                                        for (var i = 0; i < dataFields.length; i++) {
                                            const fieldName = dataFields[i];

                                            let fieldType = '';
                                            if (i < dataFieldTypes.length) {
                                                fieldType = dataFieldTypes[i];
                                            };

                                            let fieldLength = '';
                                            if (i < dataFieldLengths.length) {
                                                fieldLength = dataFieldLengths[i];
                                            };

                                            fields.push(
                                                {
                                                    "fieldName": fieldName,
                                                    "fieldType": fieldType,
                                                    "length": fieldLength,
                                                    "average": null,
                                                    "max": null,
                                                    "median": null,
                                                    "min": null,
                                                    "sum": null
                                                }
                                            );
                                        };
                                    };

                                    // 11. Return results with metadata according to the CanvasHttpResponse interface
                                    return res.json({
                                        "statusCode": "success",
                                        "message" : "Retrieved data for id:" + id,
                                        "data": results,
                                        "metaData": {
                                            "table": {
                                                "tableName": "", //oneDoc.mongooseCollection.collectionName,
                                                "nrRecordsReturned": nrRecordsReturned
                                            },
                                            "fields": fields
                                        },
                                        "error": null
                                    });
                                });
                        });
                    })
                    // 12. If any error, return err according to the CanvasHttpResponse interface
                    .catch(err =>{
                        console.error('Err after datalayer.select called from clientData.router', err);
                        return res.json({
                            "statusCode": "error",
                            "message" : "Error: Err after datalayer.select called from clientData.router for id:", id,
                            "data": null,
                            "error": err
                        });
                    });
            };
        };
    });


    // KEEP !!!  
    // This is the code to get /data?id=x from the Mongo data  ~  Disc Caching.
    // It works !!!
    //
    // Try, in case model file does not exist
    // try {
    //     // Get the model
    //     const clientSchema = '../model.model/clientData.model';
    //     const clientModel = require(clientSchema);
    //     debugData('Using Schema clientData');

    //     // Find the data (using the standard query JSON object)
    //     clientModel.find( reqQuery, (err, docs) => {

    //         // Extract metodata from the Schema, using one document
    //         // const oneDoc = clientModel.findOne();

    //         // Empty Array of fields
    //         var fields = [];

    //         // Loop on metatdata
    //         // for (var key in oneDoc.schema.obj) {
    //         //     var value = oneDoc.schema.obj[key];

    //         //     fields.push(
    //         //         {
    //         //             "fieldName": key,
    //         //             "fieldType": value.name,
    //         //             "average": null,
    //         //             "max": null,
    //         //             "median": null,
    //         //             "min": null,
    //         //             "sum": null
    //         //         }
    //         //     );
    //         // };

    //         // console.log('xx COUNT', fields, oneDoc.mongooseCollection.collectionName, docs.length)
    //         // Return the data with metadata
    //         return res.json({
    //             "statusCode": "success",
    //             "message" : "Retrieved data for id:" + id,
    //             "data": docs[0].data,
    //             "metaData": {
    //                 "table": {
    //                     "tableName": "", //oneDoc.mongooseCollection.collectionName,
    //                     "nrRecordsReturned":docs.length
    //                 },
    //                 "fields": fields
    //             },
    //             "error": null
    //         });
    //     });
    // }
    // catch (error) {
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Model clientData does not exist, or contains errors",
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// POST route
router.post('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const body = req.body;
    const query = req.query;
    const id = req.query.id;
    debugData('clientDataRouter: POST for id:', id, 'body:', body)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Create object and save to DB
        let canvasAdd = new clientModel(body);
        canvasAdd.save()
            .then(doc => {
                debugData('saved', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Added record for resource: " + resource,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not add record for id:", id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// DELETE route
router.delete('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const query = req.query;
    const id = req.query.id;

    debugData('clientDataRouter: DELETE for id:', id, 'body:', body, 'query:', query)
    debugData('');

    if (id == null) {
        return res.json({
            "statusCode": "failed",
            "message" : "Error: no id provided:" + id,
            "data": null,
            "error": null
        });
    };

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Delete from DB
        clientModel.findOneAndRemove({id: id})
            .then(doc => {
                debugData('deleted', doc)

                if (doc == null) {
                    return res.json({
                        "statusCode": "error",
                        "message" : "Deletion of data failed: could not find id = " + id,
                        "data": doc,
                        "error": null
                    });
                } else {
                    return res.json({
                        "statusCode": "success",
                        "message" : "Deleted record for id:" + id,
                        "data": doc,
                        "error": null
                    });
                };
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not delete record for id:" + id ,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// PUT route
router.put('/', (req, res, next) => {

    // Extract: body, route (params without :)
    const resource = req.params.resource.substring(1);
    const body = req.body;
    const query = req.query;
    const id = req.query.id;

    debugData('clientDataRouter: PUT for id:', id, 'body:', body, 'query:', query)
    debugData('');

    // Try, in case model file does not exist
    try {
        // Get the model
        const clientSchema = '../models/clientData.model';
        const clientModel = require(clientSchema);
        debugData('Using Schema clientData');

        // Find and Update DB
        clientModel.findOneAndUpdate(
            {id: id},
            body,
            {
              new: true,                       // return updated doc
              runValidators: true              // validate before update
            })
            .then(doc => {
                debugData('updated', doc)
                return res.json({
                    "statusCode": "success",
                    "message" : "Updated record for id:", id,
                    "data": doc,
                    "error": null
                });
            })
            .catch(err => {
                console.error(err)
                return res.json({
                    "statusCode": "error",
                    "message" : "Error: Could not update record for id:", id,
                    "data": null,
                    "error":
                        {
                            "errorObject": err
                        }
                });
        });
    }
    catch (error) {
        return res.status(400).json({
            "statusCode": "error",
            "message" : "No model file for id:", id,
            "data": null,
            "error": error
        });
    };

});

// Export
module.exports = router;