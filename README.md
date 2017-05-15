# Bill Coin 
BillCoin is an ERC-20 compliant token written on top of the ethereum network.
The version of the coin in this repo is meant to be deployed on TestRPC and accessed using the included CLI.

## About this repo
This repo contains three main parts:
1. the token contract itself
2. a javascript file for deploying the contract
3. a node-based CLI for interacting with the contract

## How to use this repo
* clone the repo
* install the dependencies:
  ** run `npm install` to install the required node packages (see package.json for the complete list of dependencies)
* start TestRPC
* deploy the contract :
  * run `node deploy_BillCoin.js`
* start the CLI:
  * in `./cli_BillCoin` update the ABI to be the ABI logged by TestRPC when you deployed the contract.
    * look for `var billCoinABI = ...`
  * in `./cli_BillCoin` update the contract address to be the contract address logged by TestRPC when you deployed the contract.
    * look for `var billCoinAddress = ...`
  * run `node cli_BillCoin`
