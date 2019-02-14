// Router to delete a Dashboard and all related info, ie number of Widgets, number of tags, etc

// Imports
const express = require('express');
const router = express.Router();
const debugDev = require('debug')('app:dev');
const createErrorObject = require('../utils/createErrorObject.util');
const createReturnObject = require('../utils/createReturnObject.util');
const dashboardSchema = '../models/dashboards.model';
const dashboardTabSchema = '../models/dashboardTabs.model';
const widgetSchema = '../models/widgets.model';
const dashboardSnapshotSchema = '../models/dashboardSnapshots.model';
const canvasMessageSchema = '../models/canvasMessages.model';
const canvasCommentSchema = '../models/canvasComments.model';
const dashboardScheduleSchema = '../models/dashboardSchedules.model';
const dashboardSubscriptionSchema = '../models/dashboardSubscriptions.model';
const DashboardTagSchema = '../models/dashboardTags.model';
const dashboardPermissionSchema = '../models/dashboardPermissions.model';
const widgetCheckpointSchema = '../models/widgetCheckpoints.model';
const canvasUserSchema = '../models/canvasUsers.model';
    // DashboardLayout
    // WidgetLayout
    // DashboardRecent

// DELETE route
router.delete('/', (req, res, next) => {

    const startPos = module.id.lastIndexOf("/");
    if (startPos > 0  &&  startPos < module.id.length) {
        moduleName = module.id.substring(startPos + 1);
    };
    const id = req.query.id;

    debugDev(moduleName + ": " + '## --------------------------');
    debugDev(moduleName + ": " + '## GET Starting with Dashboard Summary with dashboard id:', id);
    
    
    // Try, in case model file does not exist
    // try {
        // Get the model dynamically (take note of file spelling = resource)
        const dashboardModel = require(dashboardSchema);
        const dashboardTabModel = require(dashboardTabSchema);
        const widgetModel = require(widgetSchema);
        const dashboardSnapshotModel = require(dashboardSnapshotSchema);
        const canvasMessageModel = require(canvasMessageSchema);
        const canvasCommentModel = require(canvasCommentSchema);
        const dashboardScheduleModel = require(dashboardScheduleSchema);
        const dashboardSubscriptionModel = require(dashboardSubscriptionSchema);
        const dashboardTagModel = require(DashboardTagSchema);
        const dashboardPermissionModel = require(dashboardPermissionSchema);
        const widgetCheckpointModel = require(widgetCheckpointSchema);
        const canvasUserModel = require(canvasUserSchema);
    // DashboardLayout
    // WidgetLayout
    // DashboardRecent

        // NOTE: there are a large number of callbacks inside callbacks.
        //       For readibility the subsequent ones are NOT INDENTED.
        //       Its an experiment to see if it reads easier ...

        // Delete Dashboards
        const dashboardQuery = { id: req.query.id };
        // TODO - Remove later !
        if (+req.query.id <= 112) {
            return res.json(createErrorObject(
                "error",
                "Silly!!  Cannot delete ID <= 112 !",
                null
            ));
        };        

        // Delete Dashboard
        dashboardModel.findOneAndDelete(dashboardQuery)
            .then((data)=>{

            // Delete Dashboard Tabs
            const dashboardIDQuery = { dashboardID: req.query.id };
            dashboardTabModel.findManyOneAndDelete(dashboardIDQuery)
                .then((data)=>{
                })
                .catch((err)=>{
                    console.log("Error deleting Dashboard Tabs for ID: " + dashboardQuery, err);
                    return res.json(createErrorObject(
                        "error",
                        "Error deleting Dashboard Tabs for ID: " + dashboardQuery,
                        err
                    ));
                })
            
                // widgetModelQuery
                // dashboardSnapshotModel
                // canvasCommentModel
                // canvasCommentModel
                // dashboardScheduleModel
                // dashboardSubscriptionModel
                // dashboardTagModel
                // dashboardPermissionModel

                // hyperlinkedQuery = { hyperlinkDashboardID: req.query.id };
                // widgetModel.find(hyperlinkedQuery).count( (err, numberHyperlinkedWidgets) => {

                // const templateQuery = { templateDashboardID: req.query.id };
                // dashboardModel.find(templateQuery).count( (err, numberUsedAsTemplate) => {

                // const canvasUserStrtQuery = { preferenceStartupDashboardID: req.query.id };
                // canvasUserModel.find(canvasUserStrtQuery).count( (err, numberUsedAsStartup) => {

                // const canvasUserFavQuery = { preferenceStartupDashboardID: req.query.id };
                // canvasUserModel.find(canvasUserFavQuery, (err, canvasUsers) => {
        
                // // DashboardLayout
                // // WidgetLayout
                // // DashboardRecent

            // Return the data with metadata
            return res.json(
                createReturnObject(
                    "success",
                    "Retrieved Summary for Dashboard ID: " ,
                    "Okay",
                    null,
                    null,
                    null,
                    null,
                    null,
                    1,
                    null,
                    null
                    )
            );
        });

    // }
    // catch (error) {
    //     debugDev(moduleName + ": " + 'Error in canvasDashboardSummary.router', error.message)
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