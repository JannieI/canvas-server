// Connector for MySQL database, and returns a list of Fields for a given Tables

const mysql = require('mysql');
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');

module.exports = function listFields(queryObject) {
    // Selects a list of Fields for a given Tables
    // Inputs: REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
        
        try {

            const startPos = module.id.lastIndexOf("/");
            if (startPos > 0  &&  startPos < module.id.length) {
                moduleName = module.id.substring(startPos + 1);
            };

            // Set & extract the vars from the Input Params
            let serverName = queryObject.serverName;
            let databaseName = queryObject.databaseName;
            let tableName = queryObject.tableName;
            let port = queryObject.port;
            let username = queryObject.username;
            let password = queryObject.password;
            let dataSQLStatement = "DESCRIBE " + tableName + ";";
  
            let sqlParameters = '';
            debugDev(moduleName + ": " + 'Properties received:', 
                serverName, 
                databaseName, 
                tableName, 
                port, 
                username, 
                password, 
                dataSQLStatement
            );

            // Create pool Object
            const pool = mysql.createPool({
                connectionLimit  : 10,
                host             : serverName,
                user             : username,
                password         : password,
                database         : databaseName,
                port             : port,
                connectionLimit  : 10,
                supportBigNumbers: true
            });

            // Connect to DB and get the Data
            let results = [];
            pool.getConnection((err, connection) => {

                if (err) {
                    debugData(moduleName + ": " + 'Error in mysql.listFields.datalayer.getConnection', err)

                    // MySQL Error Codes
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        console.error('Database connection was closed.')
                    }
                    if (err.code === 'ER_CON_COUNT_ERROR') {
                        console.error('Database has too many connections.')
                    }
                    if (err.code === 'ECONNREFUSED') {
                        console.error('Database connection was refused.')
                    }

                    return reject(
                        createErrorObject(
                            "error",
                            "Error in mysql.listFields.datalayer.getConnection getting data from MySQL",
                            err
                        )
                    );
                };

                // Make the query
                connection.query(dataSQLStatement, [sqlParameters], (err, returnedData) => {
                    if (err) {
                        debugData(moduleName + ": " + '  mySQL.datalayer Error in getConnection', err)
                        return reject(createErrorObject(
                                "error",
                                "Error in .query getting data from MySQL",
                                err
                            )
                        );
                    };
                    //  Now, results = [data]
                    results = JSON.parse(JSON.stringify(returnedData));

                    //  Count
                    let nrRecordsReturned = 0;
                    if (results != null) {
                        nrRecordsReturned = results.length;
                    };

                    // TODO - create a standard field structure - for all DB types

                    // Return results with metadata according to the CanvasHttpResponse interface
                    return resolve(createReturnObject(
                        "success",
                        "mySQLlistFields",
                        "Retrieved Fields for Table for database : " + databaseName + ' on ' + serverName,
                        results,
                        serverName,
                        "MySQL",
                        databaseName,
                        null,
                        tableName,
                        nrRecordsReturned,
                        null,
                        null
                    ));

                });
            });
        }
        catch (error) {
            return reject({
                "statusCode": "error",
                "message" : "Error in TRY block in mysql.listFields.datalayer getting info from MySQL",
                "data": null,
                "error":error
            });
        };
    });

}
