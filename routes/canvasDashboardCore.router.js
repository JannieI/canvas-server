// Router for Current Canvas Dashboard.  It returns the Core Entities in the Dashboard
// WITHOUT data.  The data is readied by WS:
//      Dashboards
//      DashboardTabs
//      Widgets
//      WidgetCheckpoints
//      WidgetLayouts

// Input:
// - dashboardID (compulsory)
// - dashboardTabID - optional, in which case only Widgets for this TabID is returned
// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const dashboardSchema = '../models/dashboards.model';
const dashboardTabSchema = '../models/dashboardTabs.model';
const widgetSchema = '../models/widgets.model';
const widgetCheckpointSchema = '../models/widgetCheckpoints.model';
const widgetLayoutSchema = '../models/widgetLayouts.model';

// GET route
router.get('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with canvasDashboardCore with query:', req.query);
    
    // Try
    // try {
        // Get the model dynamically (take note of file spelling = resource)
        const dashboardModel = require(dashboardSchema);
        const dashboardTabModel = require(dashboardTabSchema);
        const widgetModel = require(widgetSchema);
        const widgetCheckpointModel = require(widgetCheckpointSchema);
        const widgetLayoutModel = require(widgetLayoutSchema);
        const dashboardTabID = req.query.dashboardTabID;

        // Find Dashboard
        const dashboardQuery = { id: req.query.id };
        dashboardModel.find( dashboardQuery, (err, dashboards) => {

            if (err) {
                return res.json(createErrorObject(
                    "error",
                    "Error retrieving Dashboard for ID: " + req.query.id,
                    err
                ));
            };
                
            // Find Dashboard Tabs
            const dashboardTabQuery = { dashboardID: req.query.id }
            dashboardTabModel.find( dashboardTabQuery, (err, dashboardTabs) => {

                if (err) {
                    return res.json(createErrorObject(
                        "error",
                        "Error retrieving Dashboard Tabs for ID: " + req.query.id,
                        err
                    ));
                };

                // Sort D-Tabs
                dashboardTabs = dashboardTabs.sort( (obj1,obj2) => {
                    if (obj1.displayOrder > obj2.displayOrder) {
                        return 1;
                    };
                    if (obj1.displayOrder < obj2.displayOrder) {
                        return -1;
                    };
                    return 0;
                });

                // Find Widgets (all, else filter if dashboardTabID was provided)
                let widgetQuery = { dashboardID: req.query.id }
                if (dashboardTabID != null) {
                    widgetQuery = { 
                        dashboardID: req.query.id,  
                        dashboardTabID: dashboardTabID
                    }
                };

                widgetModel.find( widgetQuery, (err, widgets) => {
                    if (err) {
                        return res.json(createErrorObject(
                            "error",
                            "Error retrieving Widgets for ID: " + req.query.id,
                            err
                        ));
                    };
                    if (widgets == null) { 
                        widgets = [];
                    };

                    // Find Widget Checkpoints
                    const widgetCheckpointQuery = { dashboardID: req.query.id }
                    widgetCheckpointModel.find( widgetCheckpointQuery, (err, widgetCheckpoints) => {

                        if (err) {
                            return res.json(createErrorObject(
                                "error",
                                "Error retrieving Widget Checkpoints for ID: " + req.query.id,
                                err
                            ));
                        };
                        if (widgetCheckpoints == null) { 
                            widgetCheckpoints = [];
                        };
        
                        // TODO - Find Widget Layouts
                        // Left out for now since it has to be redesigned

                        // Old code - getting certain DS
                        // // Load an Array of Datasource IDs in use by the Widgets on this Tab
                        // let datasourceIDincludeArray = [];
                        // for (var i = 0; i < widgets.length; i++) {
                        //     // Exclude Shapes that does not use Datasources
                        //     if (widgets[i].datasourceID != null) {
                        //         if (datasourceIDincludeArray.indexOf(widgets[i].datasourceID) < 0) {
                        //             datasourceIDincludeArray.push(widgets[i].datasourceID)
                        //         };
                        //     };
                        // };
                        // // Get Array of Datasource IDs to exclude.  This is an optional parameter from Workstation
                        // // and used in case it already has some Datasources (ie from a previous Tab)
                        // const datasourceIDexclude = req.query.datasourceIDexclude;
                        // let datasourceIDexcludeArray = [];
                        // if (datasourceIDexclude != null) {
                        //     datasourceIDexcludeArray = datasourceIDexclude.split(",");
                        //     for (var i = 0; i < datasourceIDexcludeArray.length; i++) {
                        //         datasourceIDexcludeArray[i] = +datasourceIDexcludeArray[i];
                        //     };
                        // };
                        // // Exclude requested Datasource IDs
                        // if (datasourceIDexcludeArray.length > 0) {
                        //     datasourceIDincludeArray = datasourceIDincludeArray
                        //         .filter(x => datasourceIDexcludeArray.indexOf(x) < 0);
                        // };
                        // // Create query object to filter on
                        // let datasourceQuery = { 
                        //     id: { "$in": datasourceIDincludeArray }
                        // }
                        // datasourceModel.find( datasourceQuery, (err, datasources) => {
                        //     if (err) {
                        //         return res.json(createErrorObject(
                        //             "error",
                        //             "Error retrieving Datasource for ID: " + req.query.id,
                        //             err
                        //         ));
                        //     };
                        //     if (datasources == null) { 
                        //         datasources = [];
                        //     };

                        // Return the data with metadata
                        return res.json(
                            createReturnObject(
                                "success",
                                "canvasDashboardCore",
                                "Retrieved data for Current Dashboard ID: " + req.query.id,
                                [{ 
                                    dashboards: dashboards,
                                    dashboardTabs: dashboardTabs,
                                    widgets: widgets,
                                    widgetCheckpoints: widgetCheckpoints
                                }],
                                null,
                                null,
                                null,
                                null,
                                null,
                                dashboards.length,
                                null,
                                null
                                )
                        );
                    });
                });
            });
        });
    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasDashboardCore.router', error.message)
    //     return res.status(400).json({
    //         "statusCode": "error",
    //         "message" : "Error retrieving Current Dashboard ID: " + req.query.id,
    //         "data": null,
    //         "error": error
    //     });
    // };

})

// Export
module.exports = router;