/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */

// this creates a Suitelet form that lets you write and send an email  : CR - Crowe Staffing Vertical Record:customrecord_crowestaffing_record

define(['N/ui/serverWidget', 'N/log', 'N/runtime', 'N/record','N/search','N/redirect'],
       function(serverWidget, log, runtime,record,search,redirect){

	  function onRequest(context){
      if (context.request.method === 'GET'){
		try{

        var user = runtime.getCurrentUser();
		var setupRecID;

		log.debug("Create Form");

		var form = serverWidget.createForm({title: 'System Setup'});
		form.clientScriptFileId = "1988";
		log.debug("1");
		//Account Features
		var custfld_record_grp_af = form.addFieldGroup({id : 'custpage_csa_acctfeatures',label : 'Account Features'});
log.debug("2");
		//Advanced Projects
		var apFieldId = form.addField({id :'custpage_csa_advpro',type : serverWidget.FieldType.CHECKBOX,label : 'Advanced Projects',container : 'custpage_csa_acctfeatures'});
		//apFieldId.defaultValue = _advanceProject;
log.debug("3");
		//One World Account
		var owaFieldId = form.addField({id : 'custpage_csa_oneworldacct',type : serverWidget.FieldType.CHECKBOX, label : 'One World Account',container : 'custpage_csa_acctfeatures'}).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
log.debug("4");
		//Invoicing.
		var custfld_invoicing = form.addFieldGroup({id : 'custpage_csa_invoicing',label : 'Invoicing'});
log.debug("5");
		//Use Item Group for Invoices
		var itemGrpOfInvoice = form.addField({id : 'custpage_csa_itemgrpinvoice',type : serverWidget.FieldType.CHECKBOX,label : 'Use Item Group for Invoices',container : 'custpage_csa_invoicing'}); //.updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});
log.debug("6");
		//Item Group List.
		var itemGroup = form.addField({id : 'custpage_csa_itemgroup',label : 'Item Group',type : serverWidget.FieldType.SELECT,container : 'custpage_csa_invoicing' });
			itemGroup.addSelectOption({
			value : '',
			text : ''
		});
        var itemGroups = getItemGroupItems();
		if(itemGroups.length > 0) {
		  itemGroups.forEach(function(item) {
			itemGroup.addSelectOption({
				value : item.id,
				text : item.name
			});
		  })
		}	
	log.debug("7");	
		//Standard Time List.
		var standardTime_fld = form.addField({id : 'custpage_csa_standardtime',label : 'Standard Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});
log.debug("8");
		//Double time List.
		var doubleTime_fld = form.addField({id : 'custpage_csa_doubletime',label : 'Double Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});
log.debug("9");
		//Overtime List.
		var overTime_fld = form.addField({id : 'custpage_csa_overtime',label : 'Over Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});
log.debug("10");
		var vmsDiscount =  form.addField({id : 'custpage_csa_vmsdiscount',label : 'VMS Discount',type : serverWidget.FieldType.SELECT,container : 'custpage_csa_invoicing'});
			vmsDiscount.addSelectOption({
				value : '',
				text : ''
			});
			var discountITEMS = getDiscountItems();
			if(discountITEMS.length > 0) {
			  discountITEMS.forEach(function(item) {
				vmsDiscount.addSelectOption({
					value : item.id,
					text : item.name
				});
			  })
            }
 log.debug("11");           
        //Invoice # Format.
        var invoicenoFormat = form.addField({id : 'custpage_csa_invnoformat',type : serverWidget.FieldType.TEXT,label : 'Invoice # Format',container : 'custpage_csa_invoicing'});
log.debug("12");
        //Invoice Item Description Format:  
        var invItemDescription = form.addField({id : 'custpage_csa_invitemdescription',type : serverWidget.FieldType.TEXT,label : 'Invoice Item Description Format',container : 'custpage_csa_invoicing'});
log.debug("13");
        //Sales Role:  List/Record of Sales Role
       var salesRole = form.addField({id:'custpage_csa_salesrole',type : serverWidget.FieldType.SELECT,label : 'Sales Role',source:'salesrole',container : 'custpage_csa_invoicing'});
log.debug("14");
        //Recruiter Role:  List/Record of Sales Role
        var recruiterRole = form.addField({id:'custpage_csa_recruiterole',type : serverWidget.FieldType.SELECT,label : 'Recruiter Role',source:'salesrole',container : 'custpage_csa_invoicing'});
log.debug("15");
	    //INVOICE FREQUENCY (IN HOURS)
		var invoiceFrequency = form.addField({id : 'custpage_csa_invoicefrequency',type : serverWidget.FieldType.INTEGER,label : 'INVOICE FREQUENCY (IN HOURS)',container : 'custpage_csa_invoicing'});
log.debug("16");
		//VENDOR BILL.
        var custfld_vendorbill = form.addFieldGroup({id : 'custpage_csa_vendorbill',label : 'VENDOR BILL'});
log.debug("17");
        //Vendor Bill Item Description Format: 
        var vendorBillItemDescription = form.addField({id : 'custpage_csa_billitemdescription',type : serverWidget.FieldType.TEXT,label : 'Vendor Bill Item Description Format',container : 'custpage_csa_vendorbill'});
log.debug("18");		
		//VENDOR BILL FREQUENCY (IN HOURS):
		var vbFrequency = form.addField({id : 'custpage_csa_vbfrequency',type : serverWidget.FieldType.INTEGER,label : 'VENDOR BILL FREQUENCY (IN HOURS)',container : 'custpage_csa_vendorbill'});
log.debug("19");		

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
         log.debug("Get customrecord_crowestaffing_recordSearchObj result count",searchResultCount);

		//If Record exists.
		  if(searchResultCount>0){
			  customrecord_crowestaffing_recordSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                setupRecID =  result.getValue({name: "internalid"});
                return true;
              });
              log.debug("setupRecID _",setupRecID);

		log.debug("20");

		//Get the Values from the existing Setup Record and populate in the form.
		var setup_recObj =  record.load({type: 'customrecord_crowestaffing_record',id: setupRecID,isDynamic: true});

		var _advanceProject =   setup_recObj.getValue({fieldId: "custrecord_csa_advance_project"});
		log.debug("setupRecID _advanceProject_",_advanceProject);

		var _oneWorldAccount =  setup_recObj.getValue({fieldId: "custrecord_csa_one_world_acct"});
		log.debug("_oneWorldAccount _",_oneWorldAccount);

		var _useItemGrpOfInvoice = setup_recObj.getValue({fieldId: "custrecord_csa_itemgrp_inv"});
		log.debug("_useItemGrpOfInvoice _",_useItemGrpOfInvoice);

		var _itemGroup =   setup_recObj.getValue({fieldId: "custrecord_csa_item_group"});
		log.debug("setupRecID _itemGroup_",_itemGroup);

		var _standardtime = setup_recObj.getValue({fieldId: "custrecord_csa_standard_time"});
		log.debug("setupRecID_standardtime _",_standardtime);

		var _overTime = setup_recObj.getValue({fieldId: "custrecord_csa_over_time"});
		log.debug("setupRecID _overTime _",_overTime);

		var _doubleTime = setup_recObj.getValue({fieldId: "custrecord_csa_double_time"});
		log.debug("setupRecID _doubleTime_",_doubleTime);

		var _vmsDiscount = setup_recObj.getValue({fieldId: "custrecord_csa_vms_discount"});
        log.debug("setupRecID _vmsDiscount_",_vmsDiscount);
        
        var _invoicenoFormat =  setup_recObj.getValue({fieldId: "custrecord_csa_invoicenoformat"});
		log.debug("setupRecID _invoicenoFormat",_invoicenoFormat);
		
        var _invItemDescription =  setup_recObj.getValue({fieldId: "custrecord_csa_inv_item_description"});
		log.debug("setupRecID _invItemDescription",_invItemDescription);
		
        var _salesRole =  setup_recObj.getValue({fieldId: "custrecord_csa_sales_role"});
		log.debug("setupRecID _salesRole",_salesRole);
		
        var _recruiterRole =  setup_recObj.getValue({fieldId: "custrecord_csa_recruiter_role"});
		log.debug("setupRecID _recruiterRole",_recruiterRole);
		
		var _invFrequency = setup_recObj.getValue({fieldId:"custrecord_csa_invoice_frequency"});
		log.debug("setupRecID _invFrequency",_invFrequency);

        var _vendorBillItemDescription =  setup_recObj.getValue({fieldId: "custrecord_csa_vb_itemdescription"});
		log.debug("setupRecID _vendorBillItemDescription",_vendorBillItemDescription);

		var _vbFrequency = setup_recObj.getValue({fieldId:"custrecord_csa_vendor_bill_frequency"});
		log.debug("setupRecID _vbFrequency",_vbFrequency);



    //Set Default Value in the form.
    form.updateDefaultValues({custpage_csa_advpro : _advanceProject? 'T': 'F'});
    form.updateDefaultValues({custpage_csa_oneworldacct : _oneWorldAccount? "T": "F"});
    form.updateDefaultValues({custpage_csa_itemgrpinvoice : _useItemGrpOfInvoice? "T": "F"});
    if(!_useItemGrpOfInvoice){
	  	itemGroup.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});
		}
		form.updateDefaultValues({custpage_csa_itemgroup : _itemGroup});
		form.updateDefaultValues({custpage_csa_standardtime : _standardtime});
		form.updateDefaultValues({custpage_csa_overtime : _overTime});
		form.updateDefaultValues({custpage_csa_doubletime : _doubleTime});
        form.updateDefaultValues({custpage_csa_vmsdiscount : _vmsDiscount});

        form.updateDefaultValues({custpage_csa_invnoformat : _invoicenoFormat});
		form.updateDefaultValues({custpage_csa_invitemdescription: _invItemDescription});
		form.updateDefaultValues({custpage_csa_salesrole : _salesRole});
		form.updateDefaultValues({custpage_csa_recruiterole : _recruiterRole});
		form.updateDefaultValues({custpage_csa_invoicefrequency :_invFrequency });
		form.updateDefaultValues({custpage_csa_billitemdescription : _vendorBillItemDescription});
		form.updateDefaultValues({custpage_csa_vbfrequency : _vbFrequency});
        
       }
	    form.addSubmitButton({label: 'Save'});
		context.response.writePage(form);
      }catch (e){
			 log.debug({title: e.name,details: e.message });
            }
	   }
    else{
		try{
	  log.debug("POST function");

	  var dataObject;
	  var setupRecID;

	  var advProjectBtn =  context.request.parameters.custpage_csa_advpro;
	  log.debug('advProject POST _',advProjectBtn);

	  var oneWorldAcctBtn =  context.request.parameters.custpage_csa_oneworldacct;
	  log.debug('oneWorldAcct POST _',oneWorldAcctBtn);

	  var itemGrpOfInv = context.request.parameters.custpage_csa_itemgrpinvoice;
	  log.debug('itemGrpOfInv POST _',itemGrpOfInv);

	  var itemGroup =  context.request.parameters.custpage_csa_itemgroup;
	  log.debug('itemGrp POST _',itemGroup);

	  var standrdTimeValue =  context.request.parameters.custpage_csa_standardtime;
	  log.debug('standrdTimeValue POST _',standrdTimeValue);

	  var doubleTimeValue =  context.request.parameters.custpage_csa_doubletime;
	  log.debug('doubleTimeValue POST _',doubleTimeValue);

	   var overTimeValue =  context.request.parameters.custpage_csa_overtime;
	   log.debug('overTimeValue POST _',overTimeValue);

	   var vmsDiscount = context.request.parameters.custpage_csa_vmsdiscount;
       log.debug('vmsDiscount POST _',vmsDiscount);

       var invoiceNoFormat = context.request.parameters.custpage_csa_invnoformat;
	   log.debug('invoiceNoFormat POST _',invoiceNoFormat);
	   
       var invoiceItemDescFormat = context.request.parameters.custpage_csa_invitemdescription;
	   log.debug('invoiceItemDescFormat POST _',invoiceItemDescFormat);
	   
       var salesRoleId = context.request.parameters.custpage_csa_salesrole;
	   log.debug('salesRoleId POST _',salesRoleId);
	   
       var recruiterRoleId = context.request.parameters.custpage_csa_recruiterole;
	   log.debug('recruiterRoleId POST _',recruiterRoleId);

	   var invFrequency= context.request.parameters.custpage_csa_invoicefrequency;
	   log.debug('invFrequency POST _',invFrequency);
	   
       var vbItemDescription = context.request.parameters.custpage_csa_billitemdescription;
	   log.debug('vbItemDescription POST _',vbItemDescription);

	   var vbFrequency = context.request.parameters.custpage_csa_vbfrequency;
	   log.debug('vbFrequency POST _',vbFrequency);

	  dataObject = {
					"advProjectBtn":advProjectBtn,
					"oneWorldAcctBtn":oneWorldAcctBtn,
					"itemGrpOfInv":itemGrpOfInv,
					"itemGroup":itemGroup,
					"standrdTimeValue":standrdTimeValue,
					"doubleTimeValue":doubleTimeValue,
					"overTimeValue":overTimeValue,
                    "vmsDiscount":vmsDiscount,
                    "invoiceNoFormat":invoiceNoFormat,
                    "invoiceItemDescFormat":invoiceItemDescFormat,
                    "salesRoleId":salesRoleId,
					"recruiterRoleId":recruiterRoleId,
					"invFrequency":invFrequency,
					"vbItemDescription":vbItemDescription,
					"vbFrequency":vbFrequency
				};

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
         log.debug(" Post customrecord_crowestaffing_recordSearchObj result count",searchResultCount);

		//If Record exists.
         if(searchResultCount > 0){
            customrecord_crowestaffing_recordSearchObj.run().each(function(result) {
                // .run().each has a limit of 4,000 results
                setupRecID =  result.getValue({name: "internalid"});
                return true;
              });
		log.debug("setupRecID _",setupRecID);

	   var defaultData =  _createNupdateSetUpRecord(false,setupRecID,dataObject);//update Setup Record.
	   }
	   else{
		var defaultData = _createNupdateSetUpRecord(true,setupRecID,dataObject);// create Setup Record.
	   }
	   log.debug('Default Data _',defaultData);

	    var form = serverWidget.createForm({title: 'System Setup'});
		//form.clientScriptFileId = 1899;
		//Account Features
		var custfld_record_grp_af = form.addFieldGroup({id : 'custpage_csa_acctfeatures',label : 'Account Features'});

		//Advanced Projects
		var apFieldId = form.addField({id : 'custpage_csa_advpro',type : serverWidget.FieldType.CHECKBOX,label : 'Advanced Projects',container : 'custpage_csa_acctfeatures'});

		//One World Account
		var owaFieldId = form.addField({id : 'custpage_csa_oneworldacct',type : serverWidget.FieldType.CHECKBOX,label : 'One World Account',container : 'custpage_csa_acctfeatures'}).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});

		//Invoicing.
		var custfld_invoicing = form.addFieldGroup({id : 'custpage_csa_invoicing',label : 'Invoicing'});

		//Use Item Group for Invoices
		var itemGrpOfInvoice = form.addField({id : 'custpage_csa_itemgrpinvoice',type : serverWidget.FieldType.CHECKBOX,label : 'Use Item Group for Invoices',container : 'custpage_csa_invoicing'}); //.updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});

		//Item Group List.
		var itemGroup = form.addField({id : 'custpage_csa_itemgroup',label : 'Item Group',type : serverWidget.FieldType.SELECT,container : 'custpage_csa_invoicing' });
			itemGroup.addSelectOption({
			value : '',
			text : ''
		});
        var itemGroups = getItemGroupItems();
		if(itemGroups.length > 0) {
		  itemGroups.forEach(function(item) {
			itemGroup.addSelectOption({
				value : item.id,
				text : item.name
			});
		  })
		}
		
		//Standard Time List.
		var standardTime_fld = form.addField({id : 'custpage_csa_standardtime',label : 'Standard Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});

		//Double time List.
		var doubleTime_fld = form.addField({id : 'custpage_csa_doubletime',label : 'Double Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});

		//Overtime List.
		var overTime_fld = form.addField({id : 'custpage_csa_overtime',label : 'Over Time',type : serverWidget.FieldType.SELECT,source:'item',container : 'custpage_csa_invoicing'});

		var vmsDiscount =  form.addField({id : 'custpage_csa_vmsdiscount',label : 'VMS Discount',type : serverWidget.FieldType.SELECT,container : 'custpage_csa_invoicing'});

			vmsDiscount.addSelectOption({
				value : '',
				text : ''
			});
			var discountITEMS = getDiscountItems();
			if(discountITEMS.length > 0) {
			  discountITEMS.forEach(function(item) {
				vmsDiscount.addSelectOption({
					value : item.id,
					text : item.name
				});
			  })
            }

		//Invoice # Format.
		var invoicenoFormat = form.addField({id : 'custpage_csa_invnoformat',type : serverWidget.FieldType.TEXT,label : 'Invoice # Format',container : 'custpage_csa_invoicing'});

		//Invoice Item Description Format:  Free-Form Text
		var invItemDescription = form.addField({id : 'custpage_csa_invitemdescription',type : serverWidget.FieldType.TEXT,label : 'Invoice Item Description Format',container : 'custpage_csa_invoicing'});

		//Sales Role:  List/Record of Sales Role
		var salesRole = form.addField({id:'custpage_csa_salesrole',type : serverWidget.FieldType.SELECT,label : 'Sales Role',source:'salesrole',container : 'custpage_csa_invoicing'});

		//Recruiter Role:  List/Record of Sales Role
		var recruiterRole = form.addField({id:'custpage_csa_recruiterole',type : serverWidget.FieldType.SELECT,label : 'Recruiter Role',source:'salesrole',container : 'custpage_csa_invoicing'});

		//INVOICE FREQUENCY (IN HOURS)
		var invoiceFrequency = form.addField({id : 'custpage_csa_invoicefrequency',type : serverWidget.FieldType.INTEGER,label : 'INVOICE FREQUENCY (IN HOURS)',container : 'custpage_csa_invoicing'});
		
		//VENDOR BILL.
		var custfld_vendorbill = form.addFieldGroup({id : 'custpage_csa_vendorbill',label : 'VENDOR BILL'});

		//Vendor Bill Item Description Format: Free-Form Text
		var vendorBillItemDescription = form.addField({id : 'custpage_csa_billitemdescription',type : serverWidget.FieldType.TEXT,label : 'Vendor Bill Item Description Format',container : 'custpage_csa_vendorbill'});

	   	//VENDOR BILL FREQUENCY (IN HOURS):
		var vbFrequency = form.addField({id : 'custpage_csa_vbfrequency',type : serverWidget.FieldType.INTEGER,label : 'VENDOR BILL FREQUENCY (IN HOURS)',container : 'custpage_csa_vendorbill'});

	

        log.debug("ABouth to set on Post:",defaultData)
		//Set Default Value in the form POST method.
		form.updateDefaultValues({custpage_csa_advpro : defaultData[0]? 'T': "F"});
		form.updateDefaultValues({custpage_csa_oneworldacct : defaultData[1]? "T": "F"});
		form.updateDefaultValues({custpage_csa_itemgrpinvoice : defaultData[2]? "T": "F"});
		form.updateDefaultValues({custpage_csa_itemgroup : defaultData[3]});
		form.updateDefaultValues({custpage_csa_standardtime : defaultData[4]});
		form.updateDefaultValues({custpage_csa_overtime : defaultData[5]});
		form.updateDefaultValues({custpage_csa_doubletime : defaultData[6]});
        form.updateDefaultValues({custpage_csa_vmsdiscount : defaultData[7]});
		
		form.updateDefaultValues({custpage_csa_invnoformat : defaultData[8]});
		form.updateDefaultValues({custpage_csa_invitemdescription : defaultData[9]});
		form.updateDefaultValues({custpage_csa_salesrole : defaultData[10]});
		form.updateDefaultValues({custpage_csa_recruiterole : defaultData[11]});
		form.updateDefaultValues({custpage_csa_invoicefrequency : defaultData[12]});
		form.updateDefaultValues({custpage_csa_billitemdescription : defaultData[13]});
		form.updateDefaultValues({custpage_csa_vbfrequency: defaultData[14]});
		
        
		 form.addSubmitButton({label: 'Save'});
        redirect.toTaskLink({id: 'CARD_-29'});
		 //context.response.writePage(form);
	      }
		 catch (e){
		 log.debug({title: e.name,details: e.message });
		}
	   }
	  }

	  var defaultValue = [];
	  //Function to create/update custom record.
	  function _createNupdateSetUpRecord(flag,setupRecID,dataObject){
      log.debug("_createNupdateSetUpRecord: dataObject | " + flag,dataObject);
		 var _setupRecObj;
		 //Flag is true then record will be create record.
		 if(flag){
			 log.debug('create record');
			 var _setupRecObj = record.create({
                    type: "customrecord_crowestaffing_record",
                    isDynamic: true
                });
            } else{
				log.debug('updated record');
                _setupRecObj = record.load({
                    type: "customrecord_crowestaffing_record",
                    id: setupRecID,
                    isDynamic: true
                });
            }
		    _setupRecObj.setValue({fieldId: 'custrecord_csa_advance_project',value: checkBoxValues[dataObject.advProjectBtn]});
	     	_setupRecObj.setValue({fieldId: 'custrecord_csa_one_world_acct',value: checkBoxValues[dataObject.oneWorldAcctBtn],ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_itemgrp_inv',value:checkBoxValues[dataObject.itemGrpOfInv] ,ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_item_group',value: dataObject.itemGroup,ignoreFieldChange: true});
		    _setupRecObj.setValue({fieldId: 'custrecord_csa_standard_time',value: dataObject.standrdTimeValue,ignoreFieldChange: true});
            _setupRecObj.setValue({fieldId: 'custrecord_csa_double_time',value: dataObject.doubleTimeValue,ignoreFieldChange: true});
            _setupRecObj.setValue({fieldId: 'custrecord_csa_over_time',value: dataObject.overTimeValue,ignoreFieldChange: true});
            _setupRecObj.setValue({fieldId: 'custrecord_csa_vms_discount',value: dataObject.vmsDiscount,ignoreFieldChange: true});

            _setupRecObj.setValue({fieldId: 'custrecord_csa_invoicenoformat',value: dataObject.invoiceNoFormat,ignoreFieldChange: true});
            _setupRecObj.setValue({fieldId: 'custrecord_csa_inv_item_description',value: dataObject.invoiceItemDescFormat,ignoreFieldChange: true});
            _setupRecObj.setValue({fieldId: 'custrecord_csa_sales_role',value: dataObject.salesRoleId,ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_recruiter_role',value: dataObject.recruiterRoleId,ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_invoice_frequency',value: dataObject.invFrequency,ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_vb_itemdescription',value: dataObject.vbItemDescription,ignoreFieldChange: true});
			_setupRecObj.setValue({fieldId: 'custrecord_csa_vendor_bill_frequency',value: dataObject.vbFrequency,ignoreFieldChange: true});

			

			var recordId = _setupRecObj.save({ignoreMandatoryFields: true}); //save the record.
            log.debug('recordId', recordId);

			var getRecObj =  record.load({type: 'customrecord_crowestaffing_record', id: recordId,isDynamic: true});
			var _advanceProject  = getRecObj.getValue('custrecord_csa_advance_project');
			var _oneWorldAccount = getRecObj.getValue('custrecord_csa_one_world_acct');
			var _itemGroupOfInvoice= getRecObj.getValue('custrecord_csa_itemgrp_inv');
			var _itemGroup = getRecObj.getValue('custrecord_csa_item_group');
			var _standardTime = getRecObj.getValue('custrecord_csa_standard_time');
			var _doubleTime = getRecObj.getValue('custrecord_csa_double_time');
			var _overTime = getRecObj.getValue('custrecord_csa_over_time');
			var _vmsDiscount =  getRecObj.getValue('custrecord_csa_vms_discount');
			
			var _invoiceNoFormat =  getRecObj.getValue('custrecord_csa_invoicenoformat');
			var _invoiceItemDescFormat =  getRecObj.getValue('custrecord_csa_inv_item_description');
			var _salesRoleId =  getRecObj.getValue('custrecord_csa_sales_role');
			var _recruiterRoleId =  getRecObj.getValue('custrecord_csa_recruiter_role');
			var _invFrequency =  getRecObj.getValue('custrecord_csa_invoice_frequency');
			var _vbItemDescription =  getRecObj.getValue('custrecord_csa_vb_itemdescription');
			var _vbFrequency =  getRecObj.getValue('custrecord_csa_vendor_bill_frequency');

			
	
            log.debug("MY Val:",_advanceProject)

			defaultValue.push(_advanceProject);
			defaultValue.push(_oneWorldAccount);
			defaultValue.push(_itemGroupOfInvoice);
			defaultValue.push(_itemGroup);
			defaultValue.push(_standardTime);
			defaultValue.push(_doubleTime);
			defaultValue.push(_overTime);
            defaultValue.push(_vmsDiscount);
            defaultValue.push(_invoiceNoFormat);
            defaultValue.push(_invoiceItemDescFormat);
            defaultValue.push(_salesRoleId);
			defaultValue.push(_recruiterRoleId);
			defaultValue.push(_invFrequency);	
			defaultValue.push(_vbItemDescription);
			defaultValue.push(_vbFrequency);

			return defaultValue;
		  }

      function getDiscountItems() {
        var discountItemSearch = search.create({
          type : search.Type.ITEM,
          filters: [
             ["type","anyof","Discount"]
           ],
          columns: [
              search.createColumn({name: "itemid"})
            ]
        });

        var count = discountItemSearch.runPaged().count;
        var discountItems = [];
        if(count > 0){
           discountItemSearch.run().each(function(item) {
                   var id = item.id;
                   var name =  item.getValue({name: "itemid"});
                   var itemData = {
                     id: id,
                     name : name
                   };
                   discountItems.push(itemData);
                   return true;
                 });
        }

        return discountItems;
     }
	 
	 
	 //Saved Search to get Item Group Lists only.
	 function getItemGroupItems(){
		  var itemgroupSearch = search.create({
          type : search.Type.ITEM,
          filters: [
             ["type","anyof","Group"]
           ],
          columns: [
              search.createColumn({name: "itemid"})
            ]
        });

        var count = itemgroupSearch.runPaged().count;
        var itemGroupItems = [];
        if(count > 0){
           itemgroupSearch.run().each(function(item) {
		   var id = item.id;
		   var name =  item.getValue({name: "itemid"});
		   var itemData = {
			 id: id,
			 name : name
		   };
		   itemGroupItems.push(itemData); 
		   return true;
		 });
        }
        return itemGroupItems;
	 }

      var checkBoxValues = {
        "T": true,
        "F": false
      }

  return {
    onRequest: onRequest
  };
});