// Model for datasourceSchedules collection

// Imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const counterModel = require('./counters.model')

// Schema
const DatasourceScheduleSchema = new Schema({
    id: Number,                             // Unique record ID
    datasourceID: Number,                   // FK to Datasource
    name: String,                           // Name
    description: String,                    // Description of Schedule
    repeatFrequency: String,                // Occurs: Daily, Weekly, Monthly, Yearly
    repeatsEvery: Number,                   // Repeats every x of Frequency, ie 2 = every 2nd Month
    weeklyMonday: Boolean,                  // For Weekly: occurs on this weekday
    weeklyTuesday: Boolean,                 // For Weekly: occurs on this weekday
    weeklyWednesday: Boolean,               // For Weekly: occurs on this weekday
    weeklyThursday: Boolean,                // For Weekly: occurs on this weekday
    weeklyFriday: Boolean,                  // For Weekly: occurs on this weekday
    weeklySaturday: Boolean,                // For Weekly: occurs on this weekday
    weeklySunday: Boolean,                  // For Weekly: occurs on this weekday
    monthlyOn: Number,                      // For Monthly: Occurs on this Day of month, ie 13th
    yearlyJanuary: Boolean,                 // For Yearly: Occurs in this month
    yearlyFebruary: Boolean,                // For Yearly: Occurs in this month
    yearlyMarch: Boolean,                   // For Yearly: Occurs in this month
    yearlyApril: Boolean,                   // For Yearly: Occurs in this month
    yearlyMay: Boolean,                     // For Yearly: Occurs in this month
    yearlyJune: Boolean,                    // For Yearly: Occurs in this month
    yearlyJuly: Boolean,                    // For Yearly: Occurs in this month
    yearlyAugust: Boolean,                  // For Yearly: Occurs in this month
    yearlySeptember: Boolean,               // For Yearly: Occurs in this month
    yearlyOctober: Boolean,                 // For Yearly: Occurs in this month
    yearlyNovember: Boolean,                // For Yearly: Occurs in this month
    yearlyDecember: Boolean,                // For Yearly: Occurs in this month
    startsOn: Date,                         // Date
    endsNever: Boolean,                     // True means never ends
    endsAfter: Number,                      // n times, ie 2 means it will run twice
    endsOn: Date,                           // Date

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
DatasourceScheduleSchema.pre('save', function(next) {
    var doc = this;

    // Find in the counters collection, increment and update
    counterModel.findOneAndUpdate(
        {_id: 'datasourceSchedules.id'},
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
const DatasourceScheduleModel = mongoose.model('datasourceSchedules', DatasourceScheduleSchema, 'datasourceSchedules');

// Export
module.exports = DatasourceScheduleModel;