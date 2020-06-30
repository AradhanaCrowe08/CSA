/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * 
 */
define(['N/email', 'N/record', 'N/log', 'N/search', 'N/runtime', 'N/url','N/error'],

    function(email, record, log, search, runtime, url,error) {

        // Function to auto-generate Invoice from the Item Fulfillment(current record) record created from Transfer Order.
        function beforeSubmit(context) {
            try {
                 var scriptObj = runtime.getCurrentScript();
                log.debug('scriptObj _', scriptObj);
				
				if((runtime.executionContext === runtime.ContextType.SUITELET) && (runtime.executionContext != runtime.ContextType.USER_INTERFACE)){
					//Search to get Custom record more than one.
						var customrecord_crowestaffing_recordSearchObj = search.create({
							type: "customrecord_crowestaffing_record",
							filters: [],
							columns: [
								search.createColumn({
									name: "internalid",
									sort: search.Sort.DESC,
									label: "Internal ID"
								})
							]
						});
						var searchResultCount = customrecord_crowestaffing_recordSearchObj.runPaged().count;
						log.debug("customrecord_crowestaffing_recordSearchObj result count", searchResultCount);

					    if((searchResultCount > 0) &&((context.type == context.UserEventType.CREATE) ||(context.type == context.UserEventType.COPY))){
						var err = error.create({name: 'Error', message: 'you are only allow to create setup record using setup.'})
						err.toString = function(){
							return err.message
							};
						throw err;
					  }
					}
				else{
					var err2 = error.create({name: 'Error', message: 'you can create setup record using setup.'});
						err2.toString = function(){
							return err2.message
							};
						throw err2;
				    }
			}catch (e) {
                log.debug({
                    title: e.name,
                    details: e.message
                });
            }
        }
        return {
            beforeSubmit: beforeSubmit
        };

    });