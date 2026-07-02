"use client"

import { useState, useMemo, useCallback } from "react"
import { ethers, BrowserProvider, parseEther } from "ethers"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { SpinnerOverlay } from "@/components/ui/spinner-overlay"
import MyERC20 from "@/lib/contracts/MyERC20.json"

// const ALCHEMY_MAINNET_URL = "https://rpc.ankr.com/eth"
// const ALCHEMY_SEPOLIA_URL = "https://rpc.sepolia.org"
const ALCHEMY_MAINNET_URL = "" // alchemy mainnet
// "" // infura mainnet
const ALCHEMY_SEPOLIA_URL = "" // alchemy sepolia
// "" // infura sepolia

const EthersDemo = () => {
  const [balanceValue, setBalanceValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [isInit, setIsInit] = useState(false)
  const [iConnected, setIsConnected] = useState(false)
  const [signer, setSigner] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)

  const getBalance = useCallback(async () => {
    // Demo 1
    // const provider = ethers.getDefaultProvider()
    // // const balance = await provider.getBalance(`vitalik.eth`)
    // const balance = await provider.getBalance(
    //   `0x738a73250D686F6A79200a8A9a64e32ed9A9CEda`
    // )
    // // console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`)
    // setBalanceValue(ethers.formatEther(balance))
    // setIsInit(true)

    // Demo 2
    // 连接以太坊主网
    // const providerETH = new ethers.JsonRpcProvider(ALCHEMY_MAINNET_URL)
    // 连接Sepolia测试网
    const providerSepolia = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)

    // console.log("1. 查询vitalik在主网和Sepolia测试网的ETH余额")
    // const balanceETH = await providerETH.getBalance(`vitalik.eth`)
    // const balanceSepolia = await providerSepolia.getBalance(`vitalik.eth`)
    // // 将余额输出在console（主网）
    // console.log(`ETH Balance of vitalik: ${ethers.formatEther(balanceETH)} ETH`)
    // // 输出Sepolia测试网ETH余额
    // console.log(
    //   `Sepolia ETH Balance of vitalik: ${ethers.formatEther(balanceSepolia)} ETH`
    // )
    // console.log("\n2. 查询provider连接到了哪条链")
    // const network = await providerETH.getNetwork()
    // console.log(network.toJSON())
    // const network2 = await providerSepolia.getNetwork()
    // console.log(network2.toJSON())
    // console.log("\n3. 查询区块高度")
    // const blockNumber = await providerSepolia.getBlockNumber()
    // console.log(blockNumber)
    // console.log("\n4. 查询 vitalik 钱包历史交易次数")
    // const txCount = await providerETH.getTransactionCount("vitalik.eth")
    // console.log(txCount)
    // console.log("\n5. 查询当前建议的gas设置")
    // const feeData = await providerETH.getFeeData()
    // console.log(feeData)
    // console.log("\n6. 查询区块信息")
    // const block = await providerETH.getBlock(0)
    // console.log(block)
    // console.log("\n7. 给定合约地址查询合约bytecode，例子用的WETH地址")
    // const code = await providerETH.getCode(
    //   "0xc778417e063141139fce010982780140aa0cd5ab"
    // )
    // console.log(code)

    // 查询合约信息
    // MyERC20: 0xC6F1c35B7764916bFb8c89c001F06cB02B1e7721
    // const contractMyERC20 = new ethers.Contract(
    //   "0xC6F1c35B7764916bFb8c89c001F06cB02B1e7721", // MyERC20 address
    //   MyERC20.abi,
    //   providerSepolia
    // )
    // const name = await contractMyERC20.name()
    // const totalSupply = await contractMyERC20.totalSupply()
    // const symbolWETH = await contractMyERC20.symbol()
    // const balanceOfERC20 = await contractMyERC20.balanceOf(
    //   "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda"
    // ) // Account 1
    // console.log(name)
    // console.log(ethers.formatEther(totalSupply))
    // console.log(ethers.formatEther(balanceOfERC20))

    // 链接钱包
    if (typeof window === "undefined" || !window.ethereum) {
      alert("请安装 MetaMask")
      return
    }
    setLoading(true)
    const provider = new BrowserProvider(window.ethereum)
    // 请求用户授权（会弹出小狐狸）
    await provider.send("eth_requestAccounts", [])
    // 获取 Signer（有私钥签名能力）
    const userSigner = await provider.getSigner()
    const address = await userSigner.getAddress()
    // 报错signer
    setSigner(userSigner)
    console.log("已连接")
    console.log("userSigner: ", userSigner)
    console.log("address: ", address)
    setIsConnected(true)

    // 查询钱包的信息
    const balance = await provider.getBalance(address)
    console.log("余额:", ethers.formatEther(balance), "ETH")
    const txCount = await provider.getTransactionCount(address)
    console.log("历史发送交易次数:", txCount)

    // const tx = await userSigner.sendTransaction({
    //   to: "0xBAFdb5801EA302aA7d28704c4db470217D321593", // Account 2
    //   value: parseEther("0.01"), // 0.01 ETH
    // })
    // await tx.wait() // 等待上链
    // console.log("交易哈希:", tx.hash)

    setLoading(false)
  }, [])

  const ethBalance = useMemo(() => {
    return `ETH Balance of vitalik: ${balanceValue} ETH`
  }, [balanceValue])

  const handleSendETH = useCallback(async () => {
    if (!signer) return
    setLoading(true)
    try {
      const tx = await signer.sendTransaction({
        to: "0xBAFdb5801EA302aA7d28704c4db470217D321593", // Account 2
        value: parseEther("0.01"), // 0.01 ETH
      })
      console.log("tx", tx)
      await tx.wait() // 等待上链
      console.log("交易哈希:", tx.hash)
    } catch (error) {
      console.error("发送失败:", error)
    } finally {
      setLoading(false)
    }
  }, [signer])

  // Test
  const handleSearch = useCallback(async (add: string) => {
    // 连接Sepolia测试网
    const providerSepolia = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)
    const balanceSepolia = await providerSepolia.getBalance(
      // Account 1
      // "0x738a73250D686F6A79200a8A9a64e32ed9A9CEda"
      // Account 2
      // "0xBAFdb5801EA302aA7d28704c4db470217D321593"
      add
    )
    console.log(ethers.formatEther(balanceSepolia))
  }, [])

  const handleContract = useCallback(async () => {
    try {
      // 连接Sepolia测试网
      const providerSepolia = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL)

      // 链接钱包
      if (typeof window === "undefined" || !window.ethereum) {
        alert("请安装 MetaMask")
        return
      }
      setLoading(true)
      const provider = new BrowserProvider(window.ethereum)
      // 链接钱包
      await provider.send("eth_requestAccounts", [])
      // 获取钱包签名、地址等
      const walletSigner = await provider.getSigner()
      const walletAddress = await walletSigner.getAddress()
      // 创建合约对象
      const myContract = new ethers.Contract(
        "0xC6F1c35B7764916bFb8c89c001F06cB02B1e7721", // MyERC20 address
        MyERC20.abi,
        walletSigner // 若传 providerSepolia 为只读
      )

      // 调用合约方法
      const myContractName = await myContract.name()
      console.log("Contract: ", myContractName)
      const myBalanceOf = await myContract.balanceOf(walletAddress)
      console.log("myBalanceOf: ", `${ethers.formatEther(myBalanceOf)} MTK`)

      // 保存合约实例
      setContract(myContract)

      // 得到当前block
      // const block = await provider.getBlockNumber()
      // console.log(`当前区块高度: ${block}`)
      // console.log(`打印 Transfer 事件详情: 区块${block - 10} - ${block}`)
      // 事件过滤: Transfer
      // const transferEvents = await myContract.queryFilter(
      //   "Transfer",
      //   block - 10,
      //   block
      // )
      // // 打印第1个Transfer事件
      // console.log("transferEvents: ", transferEvents)
      // console.log(transferEvents[0])
      // const curEvent = transferEvents[0]
      // if (curEvent) {
      //   const args = curEvent.args
      //   console.log(
      //     `${args[0]} 转账 ${ethers.formatEther(args[2])}MTK 给 ${args[1]}`
      //   )
      // }

      // 事件监听
      console.log("监听 Transfer 事件中...")
      myContract.on("Transfer", (from, to, amount) => {
        console.log(
          `Transfer事件触发: ${from} 转账 ${ethers.formatEther(amount)}MTK 给 ${to}`
        )
      })

      // // console.log("Transfer")
      // const tx = await myContract.transfer(
      //   "0xBAFdb5801EA302aA7d28704c4db470217D321593",
      //   ethers.parseEther("1")
      // )
      // // // 等待交易上链
      // await tx.wait()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleERC20Transfer = useCallback(async () => {
    setLoading(true)
    // console.log("Transfer")
    const tx = await contract.transfer(
      "0xBAFdb5801EA302aA7d28704c4db470217D321593",
      ethers.parseEther("1")
    )
    console.log("tx: ", tx)
    // 等待交易上链
    await tx.wait()
    setLoading(false)
  }, [contract])

  const handleERC20Search = useCallback(
    async (add: string) => {
      const targetBalanceOf = await contract.balanceOf(add)
      console.log("targetBalanceOf: ", ethers.formatEther(targetBalanceOf))
    },
    [contract]
  )

  // const getBinance14Balance = useCallback(async () => {
  //   setLoading(true)
  //   const providerBinance = new ethers.JsonRpcProvider("Alchemy API Key") // 连接币安网
  //   const addressUSDT = "0xdac17f958d2ee523a2206206994597c13d831ec7" // 合约地址
  //   const accountBinance = "0x28C6c06298d514Db089934071355E5743bf21d60" // 交易所地址
  //   // 构建ABI
  //   const abi = [
  //     "event Transfer(address indexed from, address indexed to, uint value)",
  //     "function balanceOf(address) public view returns(uint)",
  //   ]
  //   // 构建合约对象
  //   const contractUSDT = new ethers.Contract(addressUSDT, abi, providerBinance)
  //   const balanceUSDT = await contractUSDT.balanceOf(accountBinance)
  //   console.log(`USDT余额: ${ethers.formatUnits(balanceUSDT, 6)}\n`)
  //
  //   setLoading(false)
  // }, [])

  return (
    <div className="w-full max-w-[800px]">
      {/* <p>This is Ethers Page</p> */}
      <Button onClick={getBalance} disabled={loading}>
        {loading && <Spinner />}
        Go Ethers
      </Button>
      <Button
        onClick={() => {
          handleSearch("0x738a73250D686F6A79200a8A9a64e32ed9A9CEda") // Account 1
        }}
      >
        Search 1
      </Button>
      <Button
        onClick={() => {
          handleSearch("0xBAFdb5801EA302aA7d28704c4db470217D321593") // Account 2
        }}
      >
        Search 2
      </Button>
      {isInit && (
        <SpinnerOverlay loading={loading} tip="" className="mt-4 w-full">
          <div className="rounded border p-4 text-sm">{ethBalance}</div>
        </SpinnerOverlay>
      )}
      {iConnected && signer && (
        <div>
          <p>已连接到钱包</p>

          <Button onClick={handleSendETH} disabled={loading}>
            {loading && <Spinner />}
            发送ETH
          </Button>
        </div>
      )}
      <div className="mt-8">
        <Button onClick={handleContract} disabled={loading}>
          {loading && <Spinner />}
          Link to the contract
        </Button>
        {contract && (
          <div className="mt-4">
            <Button onClick={handleERC20Transfer} disabled={loading}>
              {loading && <Spinner />}
              Transfer
            </Button>
            <Button
              onClick={() => {
                handleERC20Search("0x738a73250D686F6A79200a8A9a64e32ed9A9CEda") // Account 1
              }}
            >
              Search 1
            </Button>
            <Button
              onClick={() => {
                handleERC20Search("0xBAFdb5801EA302aA7d28704c4db470217D321593") // Account 2
              }}
            >
              Search 2
            </Button>
          </div>
        )}
        {/*<div>
          <Button onClick={getBinance14Balance}>Get Binance14 Balance</Button>
        </div>*/}
      </div>
    </div>
  )
}

export default EthersDemo
