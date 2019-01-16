module.exports = function sortFilterFieldsAggregate(results, queryObject) {
    // This routines receives an Array and the res.query object, and then extracts the data for the
    // specific Widget (without changing the Datasource).  It does sorting, filtering, field selection
    // and aggregations
    // Returns final results

    try {
        // 1. Extract Query properties: these are used by the Widget to reduce the data block returned
        let sortObject = queryObject.sortObject;
        let fieldsObject = queryObject.fields;

        if (fieldsObject != null) {
            fieldsObject = JSON.parse(JSON.stringify(fieldsObject));
        };
        let filterObject = queryObject.filterObject;
        const aggregationObject = queryObject.aggregationObject;

        // 2. If (SORT_OBJECT) then results = results.sort()
        // Sort ASC on given field, -field means DESC
        // TODO
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

        // 3. If (FIELDS_STRING) then results = results[fields]
        if (fieldsObject != null  && results != null) {

            // Create Array of Fields, un-trimmed
            const fieldsArray = fieldsObject.split(",");
            for (var i = 0; i < fieldsArray.length; i++) {
                fieldsArray[i] = fieldsArray[i].trim();
            };
            
            // TODO - must be a better way in TS, or Mongo
            // Loop on keys in Object = row 1, delete field from each element in array if not
            // in fieldsArray
            Object.keys(results[0]).forEach(key => {
                console.log('key', key, fieldsArray.indexOf(key))
                if (parseInt(fieldsArray.indexOf(key)) < 0) {
                    for (var i = 0; i < results.length; i++) {
                        delete results[i][key];
                    };
                    
                    console.log('Del field', key)
                };
            });
            console.log('results 2', results)
        };

        // 4. If (FILTER_OBJECT) then results = results.filter()
        if (filterObject != null  &&  results != null) {
            filterObject = JSON.parse(filterObject)
            Object.keys(filterObject).forEach( key => {
                // Get the key-value pair
                let value = filterObject[key];

                results = results.filter(r => {
                    return r[key] == value;
                });
            });
        };

        // TODO
        // 5. If (AGGREGATION_OBJECT) then results = results.clever-thing
        
        // 6. Return
        return {
            error: null, 
            results: results
        };
    }
    catch (error) {
        return {
            error: error, 
            results: null
        };
    };
    
}