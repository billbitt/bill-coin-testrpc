// dependencies
var Web3 = require('web3');  // require in web 3
var inquirer = require('inquirer');

// configure web3
var web3_provider = "http://localhost:8545";
var web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider(web3_provider));

// define global variables
var billCoinAbi = [{"constant":false,"inputs":[{"name":"_newSellPrice","type":"uint256"},{"name":"_newBuyPrice","type":"uint256"}],"name":"setPrices","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"sellPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowances","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"buyPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_amountToMint","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"buy","outputs":[{"name":"amount","type":"uint256"}],"payable":true,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"centralMinter","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"sell","outputs":[{"name":"revenue","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newMinter","type":"address"}],"name":"transferMinter","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"_initialAmount","type":"uint256"}],"payable":true,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}];
var billCoinAddress = '0x814cb824a06999658e20b9ed3cfa094b3b0ee734';
var MyContract = web3.eth.contract(billCoinAbi);
var myContractInstance = MyContract.at(billCoinAddress);

// get and store the addresses from the testrpc
var testRpcAddressesArray = [];
web3.eth.getAccounts(function(error, result){  
    if (error){
        console.log("error:", error);
        return;
    };
    for (var i = 0; i < result.length; i++){  // store all the addresses
        testRpcAddressesArray.push(result[i]);
    };
});

// functions for the CLI
/* main function to administer the CLI */
function runCli(){  // main function that runs the CLI 
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What action would you like to take?",
        choices: ["Buy", "Sell", "Get total supply", "Get token deets", "View Balances", "Re-set Buy/Sell Price", "Exit"]
    }]).then(function(answer){
        switch(answer.action) {
            case "Buy":
                buyBillCoin()
                break;
            case "Sell":
                sellBillCoin()
                break;
            case "Get total supply":
                getTotalSupply();
                break;
            case "Get token deets":
                getTokenDeets();
                break;
            case "View Balances":
                viewBalances();
                break;
            case "Re-set Buy/Sell Price":
                resetBuySellPrice();
                break;
            case "Exit":
                process.exit();
            default:
                text = "I have never heard of that fruit...";
                runCli();
        }
    });
}

/* functions to cary out specific CLI actions */
function getTotalSupply(){
    var supplyInEther = myContractInstance.totalSupply.call().toNumber();
	console.log("total BillCoin supply =", supplyInEther); 
	// return to CLI
	runCli();
}

function getTokenDeets(){
    console.log("Coin Deets...")
	console.log(">> Coin Name:", web3.toAscii(myContractInstance.name.call())); 
	console.log(">> Coin Decimals:", myContractInstance.decimals.call().toNumber()); 
	console.log(">> Coin Symbol:", web3.toAscii(myContractInstance.symbol.call())); 
	console.log(">> Coin Version:", web3.toAscii(myContractInstance.version.call()));
    console.log(">> Minter's Address:", myContractInstance.centralMinter.call());
    console.log(">> Buy Price:", myContractInstance.buyPrice.call().toNumber()); 
	console.log(">> Sell Price:", myContractInstance.sellPrice.call().toNumber());
    console.log(">> Contract Reserves in Ether:", web3.fromWei(web3.eth.getBalance(billCoinAddress).toNumber(), 'ether'));
	console.log(">> Total BillCoin supply:", myContractInstance.totalSupply.call().toNumber()); 
	// return to CLI
	runCli();
}

function viewBalances(){
    console.log("BillCoin Balances...")
    for (var i = 0; i < testRpcAddressesArray.length; i++){
        console.log(">>", testRpcAddressesArray[i]);
        console.log(">> = " + myContractInstance.balances.call(testRpcAddressesArray[i]).toNumber());
    }
    
    //console.log(myContractInstance.balances.call());
    
}

function resetBuySellPrice(){
    inquirer.prompt([
        {
            type: "input",
            name: "buy",
            message: "What is the buy price (in ether)?",
        },
        {
            type: "input",
            name: "sell",
            message: "What is the sell price (in ether)?",
        }
    ]).then(function(answer){
        // create transaction object
        var transactionObject = {
            from: testRpcAddressesArray[0], // address that the transaction is sent from 
        };
        // log the result
        console.log("returned:", myContractInstance.setPrices.sendTransaction(answer.buy,answer.sell, transactionObject));
        // restart the CLI
        runCli();
    });
}

function buyBillCoin(){
    inquirer.prompt([
        {
            type: "input",
            name: "fromAddress",
            message: "What is the address of the buyer?",
        },
        {
            type: "input",
            name: "amount",
            message: "How much BillCoin are you buying?",
        }
    ]).then(function(answer){
        // build transaction object
        var buyPrice = myContractInstance.buyPrice.call().toNumber();
        var transactionObject = {
            from: answer.fromAddress, // address that the transaction is sent from
            value: answer.amount * buyPrice
        };
        // log the result
        console.log("returned:", myContractInstance.buy.sendTransaction(transactionObject));
        // restart cli
        runCli();
    });
}

function sellBillCoin(){
    inquirer.prompt([
        {
            type: "input",
            name: "fromAddress",
            message: "What is the address of the seller?",
        },
        {
            type: "input",
            name: "amount",
            message: "How much are you selling?",
        }
    ]).then(function(answer){
        // build transaction object
        var transactionObject = {
            from: answer.fromAddress, // address that the transaction is sent from
        };
        // log the result
        console.log("returned:", myContractInstance.sell.sendTransaction(answer.amount, transactionObject));
        // restart cli
        runCli();
    });
}

// start the CLI
runCli()

