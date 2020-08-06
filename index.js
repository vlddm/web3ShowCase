const Web3 = require('web3');
const bip39 = require('bip39');
const bip32 = require('bip32');
const ethUtil = require('ethereumjs-util')


const net = 'ropsten'
const infuraId = '976948fad74245418d5439def72b9c96'
const web3 = new Web3(`wss://${net}.infura.io/ws/v3/${infuraId}`)


async function generateAddresses() {
    //const mnemonic = bip39.generateMnemonic()
    const mnemonic = 'step exist refuse hire clean piece before napkin fix imitate menu flower'
    const seed = await bip39.mnemonicToSeed(mnemonic)
    const hdRoot = bip32.fromSeed(seed)

    console.log('Mnemonic:', mnemonic)
    let firstPrivateKey;
    for (let i = 0; i< 10; i++) {
        const path = `m/44'/60'/0'/0/${i}`
        const childNode = hdRoot.derivePath( path )
        const privateKey = '0x' + childNode.privateKey.toString('hex')
        if ( i === 0 ) firstPrivateKey = privateKey // the one with ether
        const ethPubKey =  ethUtil.importPublic(childNode.publicKey);
        const plainAddress = ethUtil.publicToAddress(ethPubKey).toString('hex')
        const address =  ethUtil.toChecksumAddress(plainAddress)
        const balanceWei = await web3.eth.getBalance(address)
        const balance = web3.utils.fromWei(balanceWei)
        console.log({path, address, privateKey, balance})
    }
    return firstPrivateKey
}

async function sendTx(privateKey) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey)
    // web3js wants all numbers to be passed as strings or BN instances to avoid precision errors
    const amount = '0.0001' 
    const destAddress = '0x96C32BD226B4A81A81c6159a139c05bd7C7C993d'
    const gasLimit = '21000'
    const gasPrice = await web3.eth.getGasPrice()
    const nonce = await web3.eth.getTransactionCount(account.address, 'latest')
    console.log(`Sending ${amount} ETH from ${account.address} to ${destAddress}, nonce: ${nonce}, gasPrice: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`)
    
    let signedTx = await web3.eth.accounts.signTransaction({
        to: destAddress,
        value: web3.utils.toWei(amount),
        gas: gasLimit,
        gasPrice: gasPrice,
        nonce: nonce
    }, privateKey)

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('transactionHash', txHash => console.log(`Got transaction hash: ${txHash}`))
    .on('receipt', receipt => console.log(`Transaction included into block`, receipt.blockNumber))
    .on('error', error=>console.error(error))

}


generateAddresses().then(sendTx)
