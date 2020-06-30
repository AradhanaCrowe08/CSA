/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/error', 'N/file','./lodash.min.js'],
       function(search, record, runtime, format, error, file,_) {

  function getInputData(){
    try {
      //Saves search of time bill record to get the customer.
      var timebillSearchObj = search.create({
        type: "timebill",
        filters: [
          ["status", "is", "T"], "AND",
          ["customer.custentity_crowestaffing_auto_invoice", "is", "T"]
          //  "AND",
          //["internalid","anyof","5798","5799","5800"]
        ],
        columns: [
          search.createColumn({name: "customer",label: "Customer"}),
          search.createColumn({name: "employee",label: "Employee"}),
          search.createColumn({name: "internalid",join: "item",label: "Internal ID"}),
          search.createColumn({name: "hours",label: "Duration"}),
          search.createColumn({name: "rate",label: "Rate"}),
          // search.createColumn({name: "custcol_crowestaffing_week_ending_d",label: "Week Ending Date"}),
          search.createColumn({name: "custcol_crowestaffing_week_ending_d",sort: search.Sort.ASC,label: "Week Ending Date"}),
          search.createColumn({name: "internalid",label: "Internal ID"})//sort: search.Sort.ASC,
        ]
      });
      var timeBillCount = timebillSearchObj.runPaged().count;
      log.debug("timeBillCount", timeBillCount);
      log.debug("timebillSearchObj", timebillSearchObj);

      return timebillSearchObj;
    } catch (ex) {
      log.error({
        title: 'map: error',
        details: ex
      });
    }
  }

  function map(context) {
    try {
      var timeBillData = JSON.parse(context.value);
      log.debug("timeBillData", timeBillData);
      if(timeBillData != -1){

        var internalID = timeBillData.values.internalid.value;
        var customerID = timeBillData.values.customer.value;
        var employeeID = timeBillData.values.employee.value;
        var weekEndingDate = timeBillData.values.custcol_crowestaffing_week_ending_d;
        var itemId = timeBillData.values['internalid.item'].value;
        var duration = timeBillData.values.hours;

        log.debug("customerID_", customerID);
        log.debug("employeeID _", employeeID);
        log.debug("Time item 1_", itemId);

        //function call to get customer, employee on the basis of advance project from setup page.
        var setupData = getDataFromSetupPage();
        if ((setupData.advanceProject == "true") || (setupData.advanceProject == true)) {

          //Staffing Bill Record to match customer/project.
          var billRecordSearchObj = search.create({
            type: "customrecord_crowestaffing_bill_record",
            filters:[ ["custrecord_br_company","anyOf",customerID], "AND", ["custrecord_br_employee","anyOf",employeeID], "AND",
                     [ ["custrecord_br_start_date","before",weekEndingDate],"AND",["custrecord_br_end_date","after",weekEndingDate]]
                    ],
            columns: [
              "custrecord_br_employee",
              "custrecord_br_company",
              "custrecord_br_division",
              "custrecord_br_sub",
              "custrecord_br_week_ending",
              "custrecord_br_primary_sales",
              "custrecord_br_primary_sales_percent",
              "custrecord_br_secondary_sales",
              "custrecord_br_secondary_sales_percent",
              "custrecord_br_tertiary_sales",
              "custrecord_br_tertiary_sales_percent",
              "custrecord_br_primary_recruiter",
              "custrecord_br_primary_recruiter_percent",
              "custrecord_br_stdbill_rate",
              "custrecord_br_ot_rate",
              "custrecord_br_ot_rate_type",
              "custrecord_br_bill_rate",
              "custrecord_br_rate_type",
              "custrecord_br_double_time",
              "custrecord_br_dt_rate",
              "custrecord_br_vms_discount",
              "custrecord_br_start_date",
              "custrecord_br_end_date",
              "custrecord_br_frequency",
              "externalid",
              "internalid"
            ]
          });

          var billRecordCount = billRecordSearchObj.runPaged().count;
          log.debug("billRecordCount", billRecordCount);


          if (billRecordCount > 0){
            var billRecordResult = billRecordSearchObj.run().getRange({start: 0,end: 1});

            var billStartDate = billRecordResult[0].getValue({name: "custrecord_br_start_date"});
            var billEndDate = billRecordResult[0].getValue({name: "custrecord_br_end_date"});
            log.debug("csaBillRecordObject _", "billStartDate _" +  billStartDate + " billEndDate _" +  billEndDate);

            var billRates = {};
            billRates["Standard Rate"] = billRecordResult[0].getValue('custrecord_br_stdbill_rate');
            billRates["Overtime Rate"] = billRecordResult[0].getValue('custrecord_br_ot_rate');
            billRates["Doubletime Rate"] = billRecordResult[0].getValue('custrecord_br_double_time');

           // var weekEnding = billRecordResult[0].getValue('custrecord_br_week_ending');
           var billWeekEndingDay = billRecordResult[0].getText('custrecord_br_week_ending');
            log.debug('Bill weekEnding _', billWeekEndingDay);

            var tbWeekDateText = getWeekEndingDateText(weekEndingDate); //new Date(weekEndingDate); //function call to get day text value.
            log.debug(' TB weekDate text _', tbWeekDateText);
            //Customer/Project ...........1 AP is T
            var customerProject = billRecordResult[0].getValue('custrecord_br_company');

            if(billWeekEndingDay == tbWeekDateText){ // if week end day:Sunday then only Record creates.

            //create Invoice record.
            var invoiceRec = record.create({type: "invoice",isDynamic: true});
            invoiceRec.setValue({fieldId: 'customform',value: 168});

            invoiceRec.setValue({fieldId: 'trandate',value: new Date(weekEndingDate)});

            invoiceRec.setValue({fieldId: 'entity',value: customerID});

            invoiceRec.setValue({fieldId: 'custbody_crowestaffing_employee',value: employeeID});

            var setupData = getDataFromSetupPage();
            log.debug('Invoice No _', setupData.invoiceNoFormat);

            var invoiceNumber = setupData.invoiceNoFormat;
            log.debug('invoiceNumber _', invoiceNumber);

            invoiceRec.setValue({fieldId: 'tranid',value: parseFloat(invoiceNumber)});

            //Set Subsidiary.
            var setupData = getDataFromSetupPage();
            log.debug('before OWA is 2_', setupData.oneWorldAccount);

            if ((setupData.oneWorldAccount == "true") || (setupData.oneWorldAccount == true)){
              invoiceRec.setValue({fieldId: 'subsidiary',value: billRecordResult[0].getValue('custrecord_br_sub')});
            }
            invoiceRec.setValue({fieldId: 'class',value: billRecordResult[0].getValue('custrecord_br_division')});

            var subsidiarySearchObj = search.create({
              type: "subsidiary",
              filters: [["internalid", "anyof", billRecordResult[0].getValue('custrecord_br_sub')]],
              columns: [search.createColumn({name: "currency",label: "currency"})]
            });

            var subsidiaryObj = subsidiarySearchObj.run().getRange({start: 0,end: 1});
            var currency = subsidiaryObj[0].getValue('currency');
            invoiceRec.setValue({fieldId: 'currency',value: currency});
            invoiceRec.setValue({fieldId: 'custbody_crowe_employee',value: billRecordResult[0].getValue('custrecord_br_employee')});
            invoiceRec.setValue({fieldId: 'custbody_crowe_primary_sales',value: billRecordResult[0].getValue('custrecord_br_primary_sales')});
            invoiceRec.setValue({fieldId: 'custbody_crowe_primary_recruiter',value: billRecordResult[0].getValue('custrecord_br_primary_recruiter')});
            invoiceRec.setValue({fieldId: 'custbody_crowestaffing_bill_record',value: billRecordResult[0].getValue('internalid')});
            invoiceRec.setValue({fieldId: 'custbody_crowestaffing_pay_record',value: 1});

            //VMS Discount of System Setup Page.
            var setupData = getDataFromSetupPage();
            var vmsDiscSetUp = setupData.setUpVMSDiscount;

            //VMS Discount from Customer Record.
            var vmsDiscountItem = search.lookupFields({type: search.Type.CUSTOMER,id: customerProject,columns: 'custentity_crowestaffing_cus_vms_item'});
            var getDiscountCustomer = vmsDiscountItem.custentity_crowestaffing_cus_vms_item[0].value;
            log.debug('getDiscountCustomer _', getDiscountCustomer);

            //For VMS Item (applicable only if VMS Discount in Staffing Bill Record) > 0%
            var vmsDiscountBillrec = billRecordResult[0].getValue('custrecord_br_vms_discount');
            log.debug('vmsDiscountBillrec _', vmsDiscountBillrec);

            if (vmsDiscountBillrec > '0%') {
              if ((vmsDiscountBillrec != '') || (vmsDiscountBillrec != null)){
                log.debug('If condition customer data');

                invoiceRec.setValue({fieldId: 'timediscount', value: getDiscountCustomer,ignoreFieldChange: true});	//Discount/Markup							
                invoiceRec.setValue({fieldId: 'timediscrate', value: parseFloat("-" + vmsDiscountBillrec)+"%"});//VMS Discount
              } else {
                log.debug('else condition vmsDiscount SetUp');
                invoiceRec.setValue({fieldId: 'timediscount',value: vmsDiscSetUp});//Discount/Markup
                invoiceRec.setValue({fieldId: 'timediscrate',value: parseFloat("-" + vmsDiscountBillrec) + "%" }); //"-" + vmsDiscountBillrec //VMS Discount
              }
            }

            var salesLineCount = invoiceRec.getLineCount({sublistId: 'saleteam'});
            log.debug('sales LineCount _',salesLineCount);

            var totalLineTime = invoiceRec.getLineCount({sublistId: 'time'});
            log.debug('totalLineTime 1_',totalLineTime);

            var matchDate;
            var arrDateObject = [];
            for (var a = 0; a < totalLineTime; a++) {
              var documentNum = invoiceRec.getSublistValue({sublistId: 'time',fieldId: 'doc',line: a});
              log.debug('documentNum _', documentNum);

              var timeBillObj = search.lookupFields({type: search.Type.TIME_BILL,id: documentNum,columns: ['employee', 'custcol_crowestaffing_week_ending_d']});
              log.debug('getEmpID all _', timeBillObj);

              getEmpID = timeBillObj.employee[0].value;
              log.debug('getEmpID _', getEmpID);

              var _tbWeekEndDate = timeBillObj.custcol_crowestaffing_week_ending_d;
              _tbWeekEndingDate = new Date(_tbWeekEndDate);

              arrDateObject.push({
                "timeBillID":documentNum,
                "lineNo": a,
                "_employee": getEmpID,
                "_weekEndingDate": _tbWeekEndDate
              });
              arrDateObject.sort(function compare(a, b) {
                var dateA = new Date(a._weekEndingDate);
                var dateB = new Date(b._weekEndingDate);
                return dateA - dateB;
              });

            }
            log.debug('Week Ending Date List _', JSON.stringify(arrDateObject)); //7,14,14

            var matchDate;
            //if(totalLineTime>0){
            //for (var a = 0; a < totalLineTime; a++){
            if(arrDateObject.length > 0){
              for (var w = 0; w < arrDateObject.length; w++){
                var tbID = invoiceRec.findSublistLineWithValue({sublistId: 'time',fieldId: 'doc',value: arrDateObject[w].timeBillID});
                log.debug("tbID _",tbID);
                invoiceRec.selectLine({sublistId: 'time',line:tbID});

                var lineEmp = invoiceRec.getCurrentSublistValue({sublistId: 'time',fieldId: 'employeedisp'});

                var documentNum = invoiceRec.getCurrentSublistValue({sublistId: 'time',fieldId: 'doc'});
                log.debug('documentNum _', documentNum);

                var timeBillObj = search.lookupFields({type: search.Type.TIME_BILL,id: documentNum,columns:['employee','custcol_crowestaffing_week_ending_d']});
                log.debug('getEmpID all _', timeBillObj);

                getEmpID = timeBillObj.employee[0].value;
                log.debug('getEmpID _', getEmpID);

                var _tbWeekEndDate = timeBillObj.custcol_crowestaffing_week_ending_d;

                if(arrDateObject[w]._employee == employeeID){

                  var timeSheetDate = invoiceRec.getCurrentSublistValue({sublistId: 'time',fieldId:'billeddate'});//,line: a
                  var timeWeekEndDate = invoiceRec.getCurrentSublistValue({sublistId:'time',fieldId:'custcol_crowestaffing_week_ending_d'});
                  var itemName =  invoiceRec.getCurrentSublistValue({sublistId: 'time',fieldId: 'itemdisp'}); //,line: a
                  log.debug('itemName',itemName);
                  _tbWeekEndingDate = new Date(_tbWeekEndDate);

                if (!matchDate){
                    matchDate =_tbWeekEndingDate; //timeSheetDate
                  }
                  log.debug('matchDate', matchDate);
                  log.debug('TB WeekEnding Date _',_tbWeekEndingDate);  


                  // if (matchDate.toString() == timeSheetDate.toString()){
                  if (matchDate.toString() == _tbWeekEndingDate.toString()){
                    invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'apply',value: true});

                    var getItemRates = search.lookupFields({
                      type: search.Type.CUSTOMER,
                      id: customerProject,
                      columns: ['custentity_crowestaffing_cus_std_item', 'custentity_crowestaffing_cus_2t_item', 'custentity_crowestaffing_cus_ot_item']
                    });
                    if(getItemRates){
                      getStandardItem = getItemRates.custentity_crowestaffing_cus_std_item[0].value;
                      getDoubleItem = getItemRates.custentity_crowestaffing_cus_2t_item[0].value;
                      getOverItem = getItemRates.custentity_crowestaffing_cus_ot_item[0].value;
                    }
                    log.debug('Items rates are_', 'getStandardItem _' + getStandardItem + 'getDoubleItem _' + getDoubleItem + ' getOverItem _' + getOverItem);

                    var setupData = getDataFromSetupPage();
                    log.debug('Setup Rate_', setupData.setupStandardTime);
                    log.debug('Setup DESCRIP_', setupData.invItemDescFormat);

                    if (itemId && (setupData.setupStandardTime || getStandardItem) && (itemName == "Crowe Standard Time")){
                      log.debug('st rate on time_', billRates["Standard Rate"]);

                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'rate',value:billRates["Standard Rate"]});
                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'memo',value:setupData.invItemDescFormat});
                    }
                    else if (itemId && (setupData.setupDoubleTime || getDoubleItem) && (itemName == "Crowe Double Time")){
                      log.debug('double rate on time_', billRates["Doubletime Rate"]);

                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'rate',value:billRates["Doubletime Rate"]});
                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'memo',value:setupData.invItemDescFormat});
                    }
                    else{ // if (itemId && (setupData.setupOverTime || getOverItem) && "Crowe OverTime"){
                      log.debug('ot rate on time_', billRates["Overtime Rate"]);

                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'rate',value: billRates["Overtime Rate"]});
                      invoiceRec.setCurrentSublistValue({sublistId: 'time',fieldId: 'memo',value:setupData.invItemDescFormat});
                    }
                    invoiceRec.commitLine({sublistId: 'time'});
                  }
                }
              }
			  //invoiceRec.setValue({fieldId: 'trandate',value: _tbWeekEndingDate});
            }
            else{return true;}
            //invoiceRec.setValue({fieldId: 'trandate',value: _tbWeekEndingDate});
            log.debug('line no',a);
            var invRecSaveId = invoiceRec.save({ignoreMandatoryFields: true});
            log.audit('invRecSaveId daily frequency _', invRecSaveId);
            }
          }
        }
      }
    }
    catch (ex) {
      log.error({
        title: 'map: error',
        details: ex
      });
    }
  }

  function reduce(context) {
    try {} catch (ex) {
      log.error({
        title: 'reduce: error',
        details: ex
      });
    }
  }

  //SS to get the data from setup page record.
  var setUpPageData = {};

  function getDataFromSetupPage() {
    var customrecord_crowestaffing_recordSearchObj = search.create({
      type: "customrecord_crowestaffing_record",
      filters: [
        ["custrecord_csa_advance_project", "is", "T"]
      ],
      columns: [
        search.createColumn({
          name: "custrecord_csa_advance_project",
          label: "Advance Projects"
        }),
        search.createColumn({
          name: "custrecord_csa_one_world_acct",
          label: "One World Account"
        }),
        search.createColumn({
          name: "custrecord_csa_sales_role",
          label: "SALES ROLE"
        }),
        search.createColumn({
          name: "custrecord_csa_inv_item_description",
          label: "Invoice Item Description Format"
        }),
        search.createColumn({
          name: "custrecord_csa_invoicenoformat",
          label: "Invoice # Format"
        }),
        search.createColumn({
          name: "custrecord_csa_recruiter_role",
          label: "Recruiter Role"
        }),
        search.createColumn({
          name: "custrecord_csa_vms_discount",
          label: "VMS Discount"
        }),
        search.createColumn({
          name: "custrecord_csa_standard_time",
          label: "Standard Time"
        }),
        search.createColumn({
          name: "custrecord_csa_double_time",
          label: "Double Time"
        }),
        search.createColumn({
          name: "custrecord_csa_over_time",
          label: "Over Time"
        })
      ]
    });
    var searchSetUpPageCount = customrecord_crowestaffing_recordSearchObj.runPaged().count;
    // log.debug("searchSetUpPageCount _", searchSetUpPageCount);

    if (searchSetUpPageCount > 0) {
      var searchSetUpPageResult = customrecord_crowestaffing_recordSearchObj.run().getRange({
        start: 0,
        end: 1
      });
      var advanceProject = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_advance_project"
      });
      var oneWorldAccount = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_one_world_acct"
      });
      var salesRole = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_sales_role"
      });
      var invItemDescFormat = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_inv_item_description"
      });
      var invoiceNoFormat = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_invoicenoformat"
      });
      var recruiterRole = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_recruiter_role"
      });
      var setUpVMSDiscount = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_vms_discount"
      });
      var setupStandardTime = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_standard_time"
      });
      var setupDoubleTime = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_double_time"
      });
      var setupOverTime = searchSetUpPageResult[0].getValue({
        name: "custrecord_csa_over_time"
      });


      setUpPageData = {
        "advanceProject": advanceProject,
        "oneWorldAccount": oneWorldAccount,
        "salesRole": salesRole,
        "invItemDescFormat": invItemDescFormat,
        "invoiceNoFormat": invoiceNoFormat,
        "recruiterRole": recruiterRole,
        "setUpVMSDiscount": setUpVMSDiscount,
        "setupStandardTime": setupStandardTime,
        "setupDoubleTime": setupDoubleTime,
        "setupOverTime": setupOverTime
      }
      // log.debug("setUpPageData", setUpPageData);

    }
    return setUpPageData;
  }

  //get the id of Pay record from the customrecord Pay record.
  function _getPayRecordData(employeeID, customerID) {
    var payRecordId;
    var payRecordSearchObj = search.create({
      type: "customrecord_crw_jd_pay_record",
      filters: [
        ["custrecord_pr_employee", "anyof", employeeID], "AND", ["custrecord_pr_company", "anyof", customerID]
      ],
      columns: [
        "internalid"
      ]
    });

    var payRecordCount = payRecordSearchObj.runPaged().count;
    log.debug("payRecordCount", payRecordCount);

    var payRecordResult = payRecordSearchObj.run().getRange({
      start: 0,
      end: 1
    });
    if (payRecordCount > 0) {

      if (payRecordResult[0] != null && payRecordResult[0] != '' && payRecordResult[0].length > 0) {
        payRecordId = payRecordResult[0].getValue({
          name: 'internalid'
        });
      }
    }
    return payRecordId;
  }

  //Get Text Value of the date.
  function getWeekEndingDateText(weekEndingDate){

    var date = new Date(weekEndingDate);
    
    var weekday=new Array(7);
    weekday[0]="Sunday";
    weekday[1]="Monday";
    weekday[2]="Tuesday";
    weekday[3]="Wednesday";
    weekday[4]="Thursday";
    weekday[5]="Friday";
    weekday[6]="Saturday";
    
    var dayTextValue = weekday[date.getDay()];
    return dayTextValue;
    }
  return {
    getInputData: getInputData,
    map: map,
    reduce: reduce
  };
});