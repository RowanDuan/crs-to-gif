## 前端实战任务


### 1. 连接钱包
```js
import { ethers } from 'ethers'

// 创建钱包实例
const createWallet = () => {
  const wallet = ethers.Wallet.createRandom()
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase
  }
}

// 连接 MetaMask
const connectMetaMask = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  await provider.send("eth_requestAccounts", [])
  return provider.getSigner()
}
```

### 2. 代币转账

```js
const transferERC20 = async (
  contractAddress: string,
  to: string,
  amount: string
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(
    contractAddress,
    ERC20_ABI,
    signer
  )
  
  const tx = await contract.transfer(to, ethers.utils.parseUnits(amount, 18))
  return tx.wait()
}
```

### 3. 监听链上事件
```js
const monitorTransfers = (contractAddress: string) => {
  const provider = ethers.getDefaultProvider('mainnet')
  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider)
  
  contract.on('Transfer', (from, to, value, event) => {
    console.log(`Transfer: ${value} from ${from} to ${to}`)
  })
}
```


 