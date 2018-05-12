const blockChain = require('../model/secjs-blockchain');

class TransactionPool {
    /**
     * create a transaction pool with config, such as transaction pool of token chain or transaction chain
     * @param {*} config
     * 
     */
    constructor(config){
        this.config = config;
        this.txBuffer = [];
        this.blockChainHashBuffer = {
            blockHashes: [],
            firstTimeUpdate: true,
            updateTime: ''
        };
        this.blockChain = new blockChain();
    }

    /**
     * save the transaction into local transaction pool
     * @param {*} transaction
     *  
     */
    addTxIntoPool(transaction){
        this.txBuffer.add(transaction);
    }

    /**
     * upate the block hash array
     * this blockChainHashBuffer is for checking the transaction in transaction pool, just compare the TxHash
     * @param {*} blockChain 
     */
    updateBlockHashArray(blockChain){
        let timeStampOfLastBlock = this.blockChain.getLastTimeStampOfBlocks();

        if(this.blockChainHashBuffer.firstTimeUpdate){
            blockChain.foreach((block) => {
                this.blockChainHashBuffer.blockHashes.add(block.TxHash);
                this.blockChainHashBuffer.firstTimeUpdate = false;
                this.blockChainHashBuffer.updateTime = new Date().getTime();
            });
        } else {
            if(this.blockChainHashBuffer.updateTime < timeStampOfLastBlock){
                let partBlockChain = blockChain.filter((block) => {
                    return block.TimeStamp >= timeStampOfLastBlock
                });
                this.blockChainHashBuffer.blockHashes.concat(partBlockChain.TxHash);
                this.blockChainHashBuffer.updateTime = new Date().getTime();
            } else {
                //do nothing
            }
        }
    }

    /**
     * remove transactions in transaction pool, if they are already upload to blockchain
     */
    compareTxWithHashTable(){
        let tempBuffer = [];
        this.txBuffer.foreach((transaction) => {
            this.blockChainHashBuffer.blockHashes.foreach((hash) => {
                if(transaction.TxHash !== hash){
                    tempBuffer.add(transaction.TxHash);
                }
            });
        });
        this.txBuffer = tempBuffer;
    }


    /**
     * to update the local transaction pool with transactions from other peers
     * @param {*} txFromOtherPeer 
     * 
     */
    addTxFromOtherPeerIntoPool(txFromOtherPeer){
        txFromOtherPeer.foreach((tx)=>{
            this.txBuffer.foreach((localTx)=> {
                if(tx.TxHash !== localTx.TxHash){
                    this.txBuffer.add(tx);
                    break;
                }
            });
        });
    }

    /**
     * get transaction status: pending, success, error
     * @param {*} transaction 
     */
    getTxStatus(transaction){
        return this.transaction.TxReceiptStatus;
    }


    /**
     * return all transaction from pool
     */
    getAllTxFromPool(){
        return JSON.stringify(this.txBuffer);
    }
    
}

module.exports = TransactionPool;