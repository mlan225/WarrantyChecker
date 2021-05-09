const fs = require('fs');
let transactionData = require('../Models/transactions.json');
let warrantyData = require('../Models/warranties.json');

// check for in warranty year
var CheckWarrantyStatus =(transaction, warranties)=> {
  return new Promise((resolve, reject) => {
    var warrantyStatus = false;

    for(var warranty in warranties){
      var checkingWarranty = true;
      
      while(checkingWarranty) {
        //check for matching warranty if a check fails, end while loop and go to next warranty in index

        // if car make has a warranty
        if(!checkWarrantyMake(warranties[warranty].Brand, transaction.Make)) {
          warrantyStatus = false;
          break;
        }
        
        // if car model is within any of the warranty years when made, currently in warranty years, and in warranty mileage
        if(!checkWarrantyPowertrain(warranties[warranty].PowertrainWarranties, transaction.Year, transaction.Mileage)) {
          warrantyStatus = false;
          break;
        }

        warrantyStatus = true;
        checkingWarranty = false;
      }
    }


    transaction.WarrantyStatus = warrantyStatus;

    resolve(transaction)
  })
}

var checkWarrantyMake =(warrantyBrand, transactionMake)=> {
  let withinWarrantyYears = true;

  if(transactionMake.toLowerCase() != warrantyBrand.toLowerCase()) {
    withinWarrantyYears = false;
  }

  return withinWarrantyYears;
}

var checkWarrantyPowertrain =(powertrainWarranties, carYear, transactionMileage)=> {
  var warrantyYearRanges = [];
  var withinPowertrainWarranty = false;
  const currentDate = new Date();
  const currentYear = parseInt(currentDate.getFullYear());    

  powertrainWarranties.forEach(warranty => {
    var years = warranty.ModelYearsCovered.split(',');
    var yearsStart = parseInt(years[0])
    var yearsEnd = parseInt(years[1])

    warrantyYearRanges.push({
      "warrantyPowertrainYears": warranty.PowertrainYears,
      "warrantyPowertrainMiles": warranty.PowertrainMiles,
      "start": yearsStart,
      "end": yearsEnd
    })
  });

  //going to assume can only match to one warranty. If match check under that warranty
  //run until all if statements pass to make true. If turned true, skip all other checks
  warrantyYearRanges.forEach(warrantyRange => {
    if(!withinPowertrainWarranty) {
      if(carYear >= warrantyRange.start && carYear <= warrantyRange.end) {
        if(currentYear - carYear <= parseInt(warrantyRange.warrantyPowertrainYears)) {
          if(transactionMileage <= warrantyRange.warrantyPowertrainMiles) {
            withinPowertrainWarranty = true;
          }
        }
      }
    }
  });


  return withinPowertrainWarranty;
}

var ValidateWarranties = ()=> {
  return new Promise(async (resolve, reject) => {
    var checkedTransactions = [];
    var uncheckedTransactions = transactionData
    var warrantDataObj = warrantyData;

    for(var transaction of uncheckedTransactions.Transactions) {
    
    
      var checkedTransaction = await CheckWarrantyStatus(transaction, warrantDataObj.Warranties);
      checkedTransactions.push(checkedTransaction);
    }
    
    resolve(checkedTransactions);
  })
}

// check for in warranty mileage

module.exports = {
  ValidateWarranties
}