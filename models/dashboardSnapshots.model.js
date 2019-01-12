// Model for DashboardSnapshots collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const DashboardSnapshotSchema = new Schema({
    id: Number,                             // Unique ID
    dashboardID: Number,                    // D for which the Snapshot is stored
    name: String,                           // Name of Snapshot
    snapshotType: String,                   // StartEditMode, BeforeFirstEdit, AutoFrequency, UserDefined
    comment: String,                        // Optional Comment
    dashboards: Array,                      // Array of D used (can include a Template) - Dashboard[]
    dashboardTabs: Array,                   // Ts of D - DashboardTab[]
    widgets: Array,                         // W of D - Widget[]
    datasets: Array,                        // dSets of D - Dataset[]
    datasources: Array,                     // DS of D - Datasource[]
    widgetCheckpoints: Array,               // Checkpoints of W - WidgetCheckpoint[]

    // Generated by the system
    editedBy: String,                       // Last user who edited this task
    editedOn: Date,                         // Date this task was last edited
    createdBy: String,                      // UserID who created this task, can be System
    createdOn: {                            // Date task was created
        type: Date,
        // `Date.now()` returns the current unix timestamp as a Number,        default: Date.now
    }

});

// This pre-hook is called before the information is saved into the database
DashboardSnapshotSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'dashboardSnapshots.id'},
        {$inc: { seq: 1} },
        { upsert: true, new: true },
        function(error, counter)   {
            if(error) {
                return next(error);
            };

            doc.id = counter.seq;
            next();
        }
    );
});

// Create Model: modelName, schema, collection
const DashboardSnapshotModel = mongoose.model(
    'dashboardSnapshots', 
    DashboardSnapshotSchema, 
    'dashboardSnapshots'
);

// Export
module.exports = DashboardSnapshotModel;