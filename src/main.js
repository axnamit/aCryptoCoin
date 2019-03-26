const {Blockchain,Transcations} =require('./blockchain');
const EC = require('elliptic').ec;
const ec=new EC('secp256k1');

const myKey=ec.keyFromPrivate('2f910cf86520cb5d280ec2c122941ecd03dd629bd838801b327ae1e12df2b60b');
const myWalletAddress = myKey.getPublic('hex');


let amitCoin=new Blockchain();

const tx1= new Transcations(myWalletAddress,'public key ',10);
tx1.signTransaction(myKey);
amitCoin.addTranscation(tx1);

console.log('\n starting the miner...');
amitCoin.minePendingTranscations(myWalletAddress);

console.log('\n balance of miner is ',amitCoin.getBalanceOfAdress(myWalletAddress));