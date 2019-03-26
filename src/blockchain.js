const SHA256= require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec=new EC('secp256k1');

class Transcations{
    constructor(fromAdress,toAdress,amount){
        this.fromAdress=fromAdress;
        this.toAdress=toAdress;
        this.amount=amount;
    }
    calculateHash(){
        return SHA256(this.fromAdress+this.toAdress+this.amount).toString();
    }
    signTransaction(signKey){
        if(signKey.getPublic('hex')!==this.fromAdress){
            throw new Error('you cannot sign transactions for other wallets');
        }

        const hashTx=this.calculateHash();
        const sig =signKey.sign(hashTx,'base64');
        this.signature =sig.toDER('hex');

    }
    isValid(){
        if(this.fromAdress===null) return true;

        if(!this.signature||this.signature.length===0){
            throw new Error('no signature in this transcation');

        }
        const publicKey= ec.keyFromPublic(this.fromAdress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
         
    }
}
class Block{
    constructor(timestamp,transcations,prevoiusHash=''){
        
        this.timestamp=timestamp;
        this.transcations=transcations;
        this.prevoiusHash=prevoiusHash;
        this.hash= this.calculateHash();
        this.nonce=0;
    }
    calculateHash(){
        return SHA256(this.timestamp+this.prevoiusHash+JSON.stringify(this.transcations)+this.nonce).toString();

    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!==Array(difficulty+1).join(0)){
            this.nonce++;
            this.hash=this.calculateHash();
        }
        console.log("blocked minde"+this.hash);
    }
    hasValidTranscations(){
        for(const tx of this.transcations){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
    
}
class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()];
        this.difficulty=2;
        this.pendingTranscations=[];
        this.miningReward=100;
    }
    createGenesisBlock(){
        return new Block(0,"01/01/1111","genesis block","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }
    /*addblock(newBlock){
        newBlock.prevoiusHash=this.getLatestBlock().hash;
       // newBlock.hash=newBlock.calculateHash();
       newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);

    }*/
    minePendingTranscations(miningRewardAdress){
        let block =new Block(Date.now(),this.pendingTranscations);
        block.mineBlock(this.difficulty);
        console.log("block successfully mined");
        this.chain.push(block);

        this.pendingTranscations=[
            new Transcations(null,miningRewardAdress,this.miningReward)
        ];
    }
    addTranscation(transcations){
        if(!transcations.fromAdress||!transcations.toAdress){
            throw Error('Transcation must include from and to address');
        }
        if(!transcations.isValid){
            throw Error('cannot add invalid transcations');
        }
        this.pendingTranscations.push(transcations);
    }
    getBalanceOfAdress(address){
        let balance=0;
        for(const block of this.chain){
            for(const trans of block.transcations){
                if(trans.fromAdress===address){
                    balance -=trans.amount;
                }
                if(trans.toAdress===address){
                    balance +=trans.amount;
                }
            }
        }
        return balance;
    }
    isChainValid(){
        for(let i=1;i<this.chain.length;i++){
            const currentBlock=this.chain[i];
            const prevoiusBlock=this.chain[i-1];

            if(!currentBlock.hasValidTranscations()){
                return false;
            }

            if(currentBlock.hash!==currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.prevoiusHash!==prevoiusBlock.hash){
                return false;
            }
            return true;
        }
       
        
    }
    
}


module.exports.Blockchain= Blockchain;
module.exports.Transcations=Transcations;