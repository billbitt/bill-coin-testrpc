pragma solidity ^0.4.11;

contract  BillCoin {

	// ERC20 State
	mapping (address => uint256) public balances;  // stores the balances of all token holders
	mapping (address => mapping (address => uint256)) public allowances;  // allowances allow a token holder to transfer authority to another token address to transfer on their behalf ( like if you want to use an exchange to make a trade on your behalf)
	uint256 public totalSupply;

	// human state
	bytes32 public name;
	uint8 public decimals;
	bytes32 public symbol;
	bytes32 public version;

	// minter state
	address public centralMinter;

	// backed by ether state
	uint256 public buyPrice;
	uint256 public sellPrice;


	// ERC20 Events
	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);
	
	// modifiers
	modifier onlyMinter {
		if(msg.sender != centralMinter) throw;
		_;
	}

	// Constructor
	function BillCoin(uint256 _initialAmount) payable {
		// erc 20
		balances[this] = _initialAmount; // puts all initial supply in the K creator's account.  Could also use 'this' to put them in this contract instead.
		totalSupply = _initialAmount; // allows anyone to call on totalSupply and get the total supply at any time;
		// human
		name = "billCoin";
		decimals = 0;
		symbol = "BC";
		version = "0.1";
		centralMinter = msg.sender;
		buyPrice = 1;
		sellPrice = 1;
	}

	// ERC20 Methods`
	function balanceOf(address _address) constant returns (uint256 balance) {
		return balances[_address];
	}

	function allowance(address _owner, address _spender) constant returns (uint256 remaining) {  
		return allowances[_owner][_spender];
	}
	
	function transfer(address _to, uint256 _value) returns (bool success) {
		// validate the request
		if(balances[msg.sender] < _value) throw;  // make sure the sender actually has the value to give
		if(balances[_to] + _value < balances[_to]) throw;  // make sure there is no overflow
		// make the transfer
		balances[msg.sender] -= _value; // reduce the value of the sender
		balances[_to] += _value; // increase the value of the receiver
		// publiclize the transfer
		Transfer(msg.sender, _to, _value); // this event lets anyone who is watching the contract know that a transfer has taken place 
		// return a boolean if successful
		return true;
	}

	function approve(address _spender, uint256 _value) returns (bool success) { // give another address custodian access 
		allowances[msg.sender][_spender] = _value;  // create a new allowance
		Approval(msg.sender, _spender, _value); // ask for approval
		// return a boolean if successful
		return true;
	} 

	function transferFrom(address _owner, address _to, uint256 _value) returns (bool success) {  // when you are spending tokens on someone's behalf
		// validate the request
		if(balances[_owner] < _value) throw;
		if(balances[_to] + _value < balances[_to]) throw;
		if(allowances[_owner][msg.sender] < _value) throw; // make sure the sender has enough allowance to send this value on behalf of the owner
		// make the transfer
		balances[_owner] -= _value;
		balances[_to] += _value;
		allowances[_owner][msg.sender] -= _value;
		// publicize the transfer
		Transfer(_owner, _to, _value);
		// return a boolean if successful
		return true;
	}

	// minter functions
	function mint(uint256 _amountToMint) onlyMinter {
		// mint the funds
		balances[this] += _amountToMint;  // increase the minter's supply
		totalSupply += _amountToMint;  // increase total supply 
		// publicize that a transfer was made from the contract to the minter
		Transfer(this, this, _amountToMint);
	}

	function transferMinter(address _newMinter) onlyMinter {
		// change the central minter adderss to be the new minter address 
		centralMinter = _newMinter;
	}

	// 'backed by ether' methods
	/* note: must create the contract so that it has enough Ether to buy back ALL tokens on the market, or else the contract will be insolvent and users won't be able to sell their tokens */
	function setPrices(uint256 _newSellPrice, uint256 _newBuyPrice) onlyMinter {
		sellPrice = _newSellPrice;
		buyPrice = _newBuyPrice;
	}

	function buy() payable returns (uint amount){
		amount = msg.value / buyPrice;
		// validate request 
		if (balances[this] < amount) throw; // validate there are enough tokens minted
		balances[this] -= amount;
		balances[msg.sender] += amount;
		// publicize the transfer
		Transfer(this, msg.sender, amount);
		// return the amount
		return amount;
	}

	function sell(uint _amount) returns (uint revenue) {
		if (balances[msg.sender] < _amount) throw;
		balances[this] += _amount;
		balances[msg.sender] -= _amount;
		revenue = _amount * sellPrice;
		if (!msg.sender.send(revenue)) {
			throw;
		} else {
			Transfer(msg.sender, this, _amount);
			return revenue;
		}
	}
}