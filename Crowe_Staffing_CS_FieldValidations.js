 /**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/runtime', 'N/log'],

       function(currentRecord, record, search, runtime, log) {
  
         function fieldChanged(context) {
	  
			var currentRecordObj = context.currentRecord;
			if (context.fieldId == "custpage_crowestaffing_itemgrpinvoice"){
				//alert('hi');
				
				var _ItemGroupfForInvoice = context.currentRecord.getValue({fieldId: 'custpage_crowestaffing_itemgrpinvoice'});
				alert('_ItemGroupfForInvoice _'+_ItemGroupfForInvoice);
				
				
				if(!_ItemGroupfForInvoice){
				  var _itemGroupFld = context.currentRecord.getField({fieldId: 'custpage_crowestaffing_itemgroup'}).isDisabled = true;
				  return true;
				}
				else{
					var _itemGroupFld = context.currentRecord.getField({fieldId: 'custpage_crowestaffing_itemgroup'});
				  return false;
				}
            }
        }

  function callClient(){
    // alert('Hello ');
    // return false
  }

  return {
    fieldChanged: fieldChanged
  };
});