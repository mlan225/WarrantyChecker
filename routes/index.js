var express = require('express');
var router = express.Router();
var transactionsController = require('../controllers/transactions.js')

/* GET home page. */
router.get('/', async function(req, res, next) {
  
  var transactionsArray = await transactionsController.ValidateWarranties()
  
  res.render('index', { 
    title: 'Transactions',
    transactions: transactionsArray
  });
});

module.exports = router;
