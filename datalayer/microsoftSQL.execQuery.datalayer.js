// Connector for Microsoft SQL database, and executes given SQL Statement

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const debugDev = require('debug')('app:dev');
const debugData = require('debug')('app:data');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const metaDataFromSource = require('./mysql.metaDataFromSource.datalayer');

module.exports = function execQueryMicrosoftSQL(queryObject) {
    // Runs given sqlStatement and returns data
    // Inputs: REQ.QUERY OBJECT
    return new Promise((resolve, reject) => {
        debugData('Start execQueryMicrosoftSQL');
        // var config = {
        //     userName: 'sa',
        //     password: 'Qwerty,123',
        //     server: 'localhost'
        // };
            // Set & extract the vars from the Input Params
            let serverName = queryObject.serverName;
            let databaseName = queryObject.databaseName;
            let sqlStatement = queryObject.sqlStatement;
            let port = queryObject.port;
            let username = queryObject.username;
            let password = queryObject.password;

            // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
            let sqlParameters = '';
            debugDev('Properties received:', serverName, databaseName, sqlStatement,
                port, username, password);

            var config = {
                server: serverName,
                authentication: {
                    type: "default",
                    options: {
                        userName: username,
                        password: password,
                    }
                }
            };

        // var Connection = require('tedious').Connection;
        var rows = [];

        var connection = new Connection(config);
        connection.on('connect', function(err) {
            //Add error handling here   
            if (err) {
                console.log('ERRRROR')
                if (err) {
                    console.log('ERRRROR')
                    return reject({
                        "statusCode": "error",
                        "message" : "Error in connection.on in microsoftSQL.execQuery.datalayer getting info from MS-SQL",
                        "data": null,
                        "error":err
                    });
                };
    

            }
            // getSqlData();
            // return resolve('done')
            console.log('Getting data from SQL');
            request = new Request("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'",
                function(err, rowCount, rows) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('rowCount', rowCount, rows);
                    return resolve({done: "done SQL for " + rows.length})
                }
            });

            request.on('row', function(columns) {
                var row = {};
                console.log('columns')
                columns.forEach(function(column) {
                    row[column.metadata.colName] = column.value;
                });
                rows.push(row);
                console.log('rows', rows.length)
            });

            request.on('done', function(rowCount, more) {
                    console.log(rowCount + ' rows returned');
                    return resolve("All good for " + rowCount)
                });
            connection.execSql(request);
            // return resolve({done: "done SQL for " + rows.length})
        
            }
        );
        var Request = require('tedious').Request;

    })
}

function getSqlData() {
    console.log('Getting data from SQL');
    request = new Request("SELECT 42 ",
        function(err, rowCount) {
        if (err) {
            console.log(err);
        } else {
            insertIntoMongoDb();
        }
    });
    request.on('row', function(columns) {
        var row = {};
        columns.forEach(function(column) {
            row[column.metadata.colName] = column.value;
        });
        rows.push(row);
    });
    connection.execSql(request);
    return resolve({done: "done SQL"})
}







// module.exports = function execQueryMicrosoftSQL(queryObject) {
//     // Runs given sqlStatement and returns data
//     // Inputs: REQ.QUERY OBJECT
//     return new Promise((resolve, reject) => {
//         debugData('Start execQueryMicrosoftSQL');

//         const sql = require('mssql')
//         const config = {
//             user: 'sa',
//             password: 'Qwerty,123',
//             server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
//             database: 'VCIB_DemoDat',
//             options: {
//                 encrypt: true // Use this if you're on Windows Azure
//             }
//         }
//         sql.connect(config, err => {
//             // ... error checks
//             if (err) {  
//                 console.log ('ERROR Connect', err.message)
//                 return reject(
//                     createErrorObject( 
//                         "error",
//                         "Error in microsoft.execQueryMicrosoftSQL.datalayer.getConnection getting data from MicrosoftSQL " + err.sqlMessage,
//                         err
//                     )
//                 );
//             };

//             // Query
//             new sql.Request().query('select 1 as number', (err, results) => {
//                 // ... error checks
//                 if (err) {
//                     console.log ('ERROR Request', err.ConnectionError)
//                     return reject(
//                         createErrorObject(
//                             "error",
//                             "Error in microsoft.execQueryMicrosoftSQL.datalayer.getConnection getting data from MicrosoftSQL " + err.sqlMessage,
//                             err
//                         )
//                     );
//                 };
            
//                 console.dir(results);

//                 // Return results with metadata according to the CanvasHttpResponse interface
//                 return resolve(createReturnObject(
//                     "success",
//                     "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
//                     results,
//                     '',  //serverName,
//                     "MicrosoftSQL",
//                     '',  //databaseName,
//                     '',  //sqlStatement,
//                     null,
//                     '',  //nrRecordsReturned,
//                     '',  //metaDataFields,
//                     null
//                 ));                
//             })

//         })
        
//         sql.on('error', err => {
//             // ... error handler
//             console.log('------------------------------')
//             console.log('ERROR sql.on', error)
//         })
//     })
// }













// module.exports = function execQueryMicrosoftSQL(queryObject) {
//     // Runs given sqlStatement and returns data
//     // Inputs: REQ.QUERY OBJECT
//     return new Promise((resolve, reject) => {

//         // try {
//             // Set & extract the vars from the Input Params
//             let serverName = queryObject.serverName;
//             let databaseName = queryObject.databaseName;
//             let sqlStatement = queryObject.sqlStatement;
//             let port = queryObject.port;
//             let username = queryObject.username;
//             let password = queryObject.password;

//             // TODO - figure out how to treat SQL Parameters, ie @LogicalBusinessDay
//             let sqlParameters = '';
//             debugDev('Properties received:', serverName, databaseName, sqlStatement,
//                 port, username, password);

//             // Create Connection Object
//             var config = {
//                 server: serverName,
//                 options: {
//                     database: databaseName,
//                     encrypt: true
//                 },
//                 authentication: {
//                     type: "default",
//                     options: {
//                         userName: username,
//                         password: password,
//                     }
//                 }
//             };
//             var connection = new Connection(config);
//             console.log('after var conn', config)


//             connection.on("connect",function(err) {
//                 let results = [];
//                 if (err) {
//                     console.log('-------------------------------------------')
//                     console.log('ERROR after connection.on', err)
//                 };
//                 console.log('after conn.on')
//                 executeStatement();
//             });

//             connection.on('debug', function(text) {
//                 console.log('in debug', text);
//             });

//             function executeStatement() {
//                 var request = new Request("select 42, 'hello world'", function(err, rowCount) {
//                     if (err) {
//                       console.log(err);
//                     } else {
//                       console.log(rowCount + ' rows');
//                     }

//                     connection.close();
//                 });

//                 request.on("row", function (columns) {
//                     console.log('after request.on')

//                     var item = {};
//                     columns.forEach(function (column) {
//                         if (column.value === null) {
//                             console.log('NULL');
//                         } else {
//                             console.log(column.value);
//                         }
//                         item[column.metadata.colName] = column.value;
//                     });
//                 });

//                 request.on('done', function(rowCount, more) {
//                     console.log(rowCount + ' rows returned');
//                 });

//                 connection.execSql(request);
// // console.log('result', results)

// //                     // Return results with metadata according to the CanvasHttpResponse interface
// //                     return resolve(createReturnObject(
// //                         "success",
// //                         "Ran query ' + sqlStatement + ' for database : " + databaseName + ' on ' + serverName,
// //                         results,
// //                         serverName,
// //                         "MSSQL",
// //                         databaseName,
// //                         sqlStatement,
// //                         null,
// //                         0,
// //                         'metaDataFields',
// //                         null
// //                     ));


//             }
//         // }
//         // catch (error) {
//         //     return reject({
//         //         "statusCode": "error",
//         //         "message" : "Error in TRY block in microsoftSQL.execQuery.datalayer getting info from MS-SQL",
//         //         "data": null,
//         //         "error":error
//         //     });
//         // };
//     });

// }
