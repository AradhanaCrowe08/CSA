/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime', 'N/log'],

       function(currentRecord, record, search, runtime, log) {
		  function saveRecord(context) {
        try{

			 var currentRecordObj = context.currentRecord; 
			 
       //Search to get Setup Custom Record is exists or not.
          var customrecord_crowestaffing_recordSearchObj = search.create({
            type: "customrecord_crowestaffing_record",
            filters:
            [
            ],
            columns:
            [   search.createColumn({
				 name: "internalid",
				 sort: search.Sort.DESC,
				 label: "Internal ID"
			  })
	        ]
         });
         var searchResultCount = customrecord_crowestaffing_recordSearchObj.runPaged().count;
         log.debug("customrecord_crowestaffing_recordSearchObj result count",searchResultCount);
		
	    	//If Record exists.
         if(searchResultCount > 0){
           alert('You cannot create setup record using UI');
		   return false;
            }
			else{
				return true;
			}
          }catch (e){ 
          log.debug({title: e.name,details: e.message });
            }
		  }

  function callClient(){
     alert('You cannot create');
     return false
  }

  return {
    saveRecord: saveRecord
   // callClient: callClient
  };
});