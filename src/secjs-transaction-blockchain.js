const fs = require('fs')
const SECUtil = require('@sec-block/secjs-util')
const SECHash = require('./secjs-hash.js')
const SECDataHandler = require('@sec-block/secjs-datahandler')
const dbconfig = {
  'DBPath': '../data/'
}

let secDataHandler = new SECDataHandler(dbconfig)

class SECTransactionBlockChain {
  /**
   * create a transaction chain block chain with config
   * @param {*} blockchain, config
   *
   */
  constructor (config = { filePath: process.cwd() + '/data/txchain.json' }) {
    this.txBlockChain = []
    this.config = config
    this.util = new SECUtil()
  }

  /**
   * generate genesis block
   */
  _generateGenesisBlock () {
    let hashalgo = 'sha256'
    let secjsHash = new SECHash(hashalgo)
    let block = {}
    block.ParentHash = 'Genesis'
    block.TransactionsRoot = ''
    block.ReceiptRoot = ''
    block.Number = 0 // txBlockChain.currentHeight + 1
    block.TimeStamp = 1530297308
    block.ExtraData = 'SEC Hello World'
    block.Nonce = '' // powCal.getNonce(this.block)
    block.Beneficiary = 'SEC-Miner'
    block.Hash = secjsHash.hash(JSON.stringify(block))
    block.Transactions = []
    return block
  }

  /**
   * Initialize the class token-blockchain
   * @param {requestCallback} callback - The callback that handles the response.
   */
  init (callback) {
    if (fs.existsSync(this.config.filePath)) {
      this._readBlockChainFile((data) => {
        this.txBlockChain = JSON.parse(data)
        callback(this.txBlockChain)
      })
    } else {
      let genesisBlock = this._generateGenesisBlock()
      this.addBlockToChain(genesisBlock)
      this.writeBlockChainToFile(() => {
        callback(this.txBlockChain)
      })
    }
  }

  /**
   * put genesis into token block chain level database
   */
  putGenesis (genesis, cb) {
    secDataHandler.writeTxChainToDB(genesis, (err) => {
      if (err) {
        throw new Error('Something wrong with writeTokenChainToDB function')
      }
      cb()
    })
  }

  /**
   * get Token Block from db
   * @param {Array} hashArray
   * @param {function} callback
   */
  getBlocksWithHashFromDB (hashArray, cb) {
    secDataHandler.getTxBlockFromDB(hashArray, cb)
  }

  /**
   * get Blocks from db
   */
  getBlocksFromDB (hashArray, cb) {
    let blocks = []
    hashArray.foreach((hash) => {
      blocks.push(secDataHandler.getAccountTx(hash))
    })
    return blocks
  }

  /**
   * store the blockchain to a local file
   * @param {*} file
   *
   */
  writeBlockChainToFile (callback) {
    fs.writeFile(this.config.filePath, JSON.stringify(this.txBlockChain), (err) => {
      if (err) throw err
      callback()
    })
  }

  /**
   * get blockchain model
   */
  getBlockChain () {
    return this.txBlockChain
  }

  /**
   * get Token Chain from DB
   * @param {number} minHeight
   * @param {number} maxHeight
   * @param {function} callback
   */
  getBlockChainFromDB (minHeight, maxHeight, cb) {
    secDataHandler.getTxChain(minHeight, maxHeight, cb)
  }

  /**
   * push a block at the bottom of the blockchain
   * @param {*} block
   */
  addBlockToChain (block) {
    if (this.getCurrentHeight() < block.Number) {
      this.txBlockChain.push(block)
    } else {
      // TODO: must changed in future
    }
  }

  /**
    * Put transaction block to db
    * @param {*} block the block object in json formation
    * @param {*} cb
  */
  putBlockToDB (block, cb) {
    secDataHandler.writeTokenChainToDB(block, (err) => {
      if (err) {
        throw new Error('Something wrong with writeTokenChainToDB function')
      }
      cb()
    })
  }

  /**
   * return last block's height
   * @param {*} None
   *
   */
  getCurrentHeight () {
    return this.txBlockChain.length - 1
  }

  /**
   * get the dificulty of blockchain
   */
  getGenesisBlockDifficulty () {
    return this.txBlockChain[0].Difficulty
  }

  /**
   * get genius block from buffer
   */
  getGenesisBlock () {
    return this.txBlockChain[0]
  }

  /**
   * get the genesis block hash
   */
  getGenesisBlockHash () {
    return this.txBlockChain[0].Hash
  }

  /**
   * get last block
   */
  getLastBlock () {
    return this.txBlockChain[this.getCurrentHeight()]
  }

  /**
   * return last block's hash value
   * @param {*} None
   *
   */
  getLastBlockHash () {
    return this.txBlockChain[this.getCurrentHeight()].Hash
  }

  /**
   * return last block's timestamp
   * @param {*} None
   *
   */
  getLastBlockTimeStamp () {
    return this.txBlockChain[this.getCurrentHeight()].TimeStamp
  }

  /**
   * read saved blockchain file
   * @param {function} callback
   */
  _readBlockChainFile (callback) {
    fs.readFile(this.config.filePath, (err, data) => {
      if (err) {
        throw new Error(`Transaction Blockchain can not be loaded`)
      } else {
        callback(data)
      }
    })
  }

  /**
   * get block from db
   */
  getBlockFromDB (hash, cb) {
    secDataHandler.getAccountTx(hash, cb)
  }
}

module.exports = SECTransactionBlockChain
