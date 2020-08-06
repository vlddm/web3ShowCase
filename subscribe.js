const Web3 = require('web3');

const net = 'ropsten'
const infuraId = '976948fad74245418d5439def72b9c96'
const web3 = new Web3(`wss://${net}.infura.io/ws/v3/${infuraId}`)

const watchAddresses = ['0x96C32BD226B4A81A81c6159a139c05bd7C7C993d', '0x106B0F886ffe38Eb11554009C56bB80D652Ae1A9']

web3.eth.subscribe('newBlockHeaders')
.on("connected", ()=>console.log('Connected to eth node, waiting for block'))
.on("data", fetchBlock)
.on("error", console.error);

async function fetchBlock(block) {
    const blockNumber = block.number - 2 // Infura is late for blocks sometimes, so requesting back to 2 blocks
    const blockData = await web3.eth.getBlock(blockNumber, true)
    console.log(`Fetched new block ${blockNumber}`)
    let addressesToUpdate = []
    blockData.transactions.map(t=>{
        if (watchAddresses.includes(t.to)) 
            addressesToUpdate.push(t.to)
    })

    addressesToUpdate.map(async address=>{
        const balanceWei = await web3.eth.getBalance(address)
        const balance = web3.utils.fromWei(balanceWei)
        console.log(`New ${address} balance: ${balance} ETH`)
    })
}
console.log('here')
