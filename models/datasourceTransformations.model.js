// Model for datasourceTransformations collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const DatasourceTransformationSchema = new Schema({
    id: Number,                             // Unique ID
    transformationID: Number,               // FK to Tr
    datasourceID: Number,                   // FK to DS
    sequence: Number,                       // Order, 1 at top
    parameterValue: [ { String } ],         // Parameter Values for this transformation

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
DatasourceTransformationSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'datasourceTransformations.id'},
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
const DatasourceTransformationModel = mongoose.model('datasourceTransformations', DatasourceTransformationSchema, 'datasourceTransformations');

// Export
module.exports = DatasourceTransformationModel;