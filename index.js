const Web3 = require('web3');
const bip39 = require('bip39');
const bip32 = require('bip32');
const ethUtil = require('ethereumjs-util')

const net = 'rinkeby'
const infuraId = '976948fad74245418d5439def72b9c96'
const web3 = new Web3(`wss://${net}.infura.io/ws/v3/${infuraId}`)
 
async function generateAddresses() {
    const mnemonic = bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const hdRoot = bip32.fromSeed(seed)

    console.log('Mnemonic:', mnemonic)
    for (let i = 0; i< 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`
        const childNode = hdRoot.derivePath( path )
        const privateKey = '0x' + childNode.privateKey.toString('hex')
        const ethPubKey =  ethUtil.importPublic(childNode.publicKey);
        const plainAddress = ethUtil.publicToAddress(ethPubKey).toString('hex')
        const address =  ethUtil.toChecksumAddress(plainAddress)
        console.log({path, address, privateKey})
    }
}

generateAddresses()
