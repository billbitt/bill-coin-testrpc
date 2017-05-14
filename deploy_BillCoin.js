// dependencies
var Web3 = require('web3');  // require in web 3
var solc= require('solc');
var fs = require('fs');

// variables
var contractName = "BillCoin";
var contractFileName = "humanBillCoin.sol"

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')) // start new instance of web3, hooked up to the test RPC

var source = fs.readFileSync(`./${contractFileName}`, 'utf8')
console.log("source", source);
//console.log("type of source", typeof source);

var compiled = solc.compile(source); // note: needs a string version of the contract
//console.log("compiled:", compiled);

var bytecode = compiled.contracts[`:${contractName}`].bytecode  // this is what we will actually deploy to the blockchain.  
//note: use name of contract instead of 'HellowWorld'

var abi = JSON.parse(compiled.contracts[`:${contractName}`].interface)  // defines the public facing interface of your contract.  i.e. what methods the outside world can call on it

// create a new 'contract factory'
var contractFactory = web3.eth.contract(abi);  //Q: why do we pass only the abi??

// variables arguments for the deployement
var deployer = web3.eth.accounts[0];  // define accounts we will use for the contract 
var initialAmountOfCoins = 300;

/* deploy the contract */
var deployed = contractFactory.new(initialAmountOfCoins,  //note: pass in constructor arguments, then the contract object. This is because of our constructor function expects 2 arguments?
	{ 
		from: deployer, // address that the contract is deployed from
		data: bytecode, // bytecode of contract we want to deploy
		gas: 3000000, 
		gasPrice: 5, 
		value: web3.toWei(0, 'ether'), // 'value' is how much ether to send from 'from' address to this contract upon creation
	}, 
	(error, contract) => { 
		if (!error){
			console.log("successfully deployed")
			console.log("deployed:", deployed.address)
			console.log("ABI for deployed:", compiled.contracts[`:${contractName}`].interface)
		} else {
			console.log("failed to deploy")
			console.log(error);
		}
	}
);

