# Web3 Demo 页面对比：Ethers / Viem / Wagmi

本项目包含三个 Web3 学习 Demo，路由分别为 `/ethers`、`/viem`、`/wagmi`。三者实现相似的链上能力（连接钱包、查余额、发 ETH、ERC20 读写、监听事件），但技术栈、抽象层次和开发思路不同。

---

## 1. 总览

| 项目 | `/ethers` | `/viem` | `/wagmi` |
|------|-----------|---------|----------|
| **核心库** | ethers v6 | viem v2 | wagmi v2 + RainbowKit |
| **底层协议** | ethers 内置 JSON-RPC | viem（TypeScript 以太坊库） | viem（wagmi 内部使用） |
| **UI 层** | 手写 Button / Card | 手写 Button / Card | RainbowKit `<ConnectButton />` |
| **React 集成** | 无专用 hooks，纯 `useState` + 回调 | 无专用 hooks，纯 `useState` + 回调 | `useAccount`、`useBalance`、`useWatchContractEvent` 等 |
| **Provider 架构** | 无全局 Provider | 无全局 Provider | `WagmiProvider` + `QueryClientProvider` + `RainbowKitProvider` |
| **路由布局** | `app/ethers/page.tsx` | `app/viem/page.tsx` | `app/wagmi/layout.tsx`（子路由级 Provider） |
| **主要文件** | `components/Ethers/EthersPage.tsx` | `components/Viem/ViemPage.tsx` | `components/Wagmi/WagmiPage.tsx` |
| **共享资源** | `lib/contracts/MyERC20.json` | 同左 | 同左 |

---

## 2. 技术架构

### 2.1 分层对比

```
┌─────────────────────────────────────────────────────────────┐
│  /ethers                                                    │
│  React UI → ethers (BrowserProvider / Contract / Signer)    │
│           → window.ethereum (MetaMask)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  /viem                                                      │
│  React UI → viem (Public Client + Wallet Client)            │
│           → custom(window.ethereum) 或 http(RPC)            │
│  可选：Server Action (app/viem/actions.ts) 服务端读链       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  /wagmi                                                     │
│  React UI → RainbowKit (钱包 UI)                            │
│           → wagmi hooks + wagmi/actions                     │
│           → viem → custom(window.ethereum)                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 连接钱包思路

| Demo | 方式 | 代码要点 |
|------|------|----------|
| **Ethers** | `BrowserProvider` 一体化 | `new BrowserProvider(window.ethereum)` + `provider.send("eth_requestAccounts")` + `getSigner()` |
| **Viem** | 读写分离 | `createPublicClient`（读）+ `createWalletClient`（写），均用 `custom(window.ethereum)` |
| **Wagmi** | 框架 + UI 组件 | `<ConnectButton />` + `useAccount()`，config 在 `createWagmiConfig()` 中配置 |

**核心差异**：Ethers 的 Provider 读写Signing 一体；Viem 强制区分 Public Client 与 Wallet Client；Wagmi 在 Viem 之上封装 React 状态与 RainbowKit UI。

---

## 3. 功能实现对比

三个页面均支持以下能力（Sepolia 测试网 + MyERC20 合约）：

| 功能 | Ethers | Viem | Wagmi |
|------|--------|------|-------|
| 连接钱包 | 手动 `handleLinkWallet` | 手动 `handleLinkWallet` | `<ConnectButton />` |
| 查 ETH 余额 | `provider.getBalance()` | `publicClient.getBalance()` | `useBalance()` / `getBalance(config, …)` |
| 发 Sepolia ETH | `signer.sendTransaction()` + `tx.wait()` | `walletClient.sendTransaction()` | `sendTransaction(config, …)` |
| 连接 ERC20 合约 | `new ethers.Contract(abi, signer)` | `getContract({ public, wallet })` | 直接用 ABI + actions/hooks |
| 读合约 name/symbol/supply | `contract.name()` 等 | `contract.read.name()` 等 | `readContract(config, …)` |
| 读 balanceOf | `contract.balanceOf(addr)` | `contract.read.balanceOf([addr])` | `readContract(…, functionName: "balanceOf")` |
| 发 ERC20 transfer | `contract.transfer()` + `tx.wait()` | `contract.write.transfer()` + `waitForTransactionReceipt` | `writeContract(config, …)` |
| 监听 Transfer | `contract.on("Transfer", cb)` | `contract.watchEvent.Transfer({}, { onLogs })` | `useWatchContractEvent({ eventName: "Transfer" })` |

### 3.1 API 对照表（常用操作）

| 操作 | Ethers | Viem | Wagmi |
|------|--------|------|-------|
| 连接钱包 | `new BrowserProvider(window.ethereum)` | `createWalletClient({ transport: custom(window.ethereum) })` | `useAccount()` + ConnectButton |
| 查余额 | `provider.getBalance(address)` | `publicClient.getBalance({ address })` | `useBalance({ address })` |
| 发 ETH | `signer.sendTransaction({ to, value })` | `walletClient.sendTransaction({ to, value })` | `sendTransaction(config, { to, value })` |
| 读合约 | `contract.balanceOf(addr)` | `contract.read.balanceOf([addr])` | `readContract(config, { functionName, args })` |
| 写合约 | `contract.transfer(to, amount)` | `contract.write.transfer([to, amount])` | `writeContract(config, { functionName: "transfer", args })` |
| 监听事件 | `contract.on("Transfer", fn)` | `watchEvent.Transfer({}, { onLogs })` | `useWatchContractEvent({ onLogs })` |
| 等待确认 | `await tx.wait()` | `await publicClient.waitForTransactionReceipt({ hash })` | 需自行 `waitForTransactionReceipt` 或扩展 |

> **Viem 注意**：参数通常放在数组里，如 `balanceOf([address])`、`transfer([to, amount])`。

---

## 4. 各 Demo 详细说明

### 4.1 Ethers（`/ethers`）

**定位**：经典以太坊 JavaScript 库，API 直观，适合理解 Provider / Signer / Contract 模型。

**核心技术**：
- `ethers` v6：`BrowserProvider`、`Contract`、`formatEther` / `parseEther`
- `react-hook-form` + `zod`：ETH 转账表单校验
- 全程 Client Component，状态用 `useState` 管理

**RPC 来源**：
- 当前使用 `BrowserProvider(window.ethereum)`，RPC 走 MetaMask
- 注释中保留了 `JsonRpcProvider(ALCHEMY_URL)` 直连 RPC 的写法

**思路特点**：
- 一个 `provider` 对象同时负责读链和连接钱包
- `signer` 负责签名发交易
- `Contract` 实例绑定 signer 后可直接 `transfer()`、`on("Transfer")`
- 代码量适中，概念最少，最适合入门

**关键文件**：
- `components/Ethers/EthersPage.tsx`
- `app/ethers/page.tsx`

---

### 4.2 Viem（`/viem`）

**定位**：现代 TypeScript 以太坊库，类型安全、模块化，读写职责清晰。

**核心技术**：
- `viem`：`createPublicClient`、`createWalletClient`、`getContract`、`custom` transport
- 可选 `app/viem/actions.ts`：Server Action 在服务端通过 `http(RPC)` 读链（避免浏览器 CORS）

**RPC 来源**：
- 钱包模式：`custom(window.ethereum)`（与 Ethers 的 BrowserProvider 等价）
- 服务端模式：`http(RPC_URL)`（如 publicnode / Alchemy，用于 Server Action）
- 浏览器直连公共 RPC 会遇到 **CORS**，读链数据优先走 Server Action 或钱包 RPC

**思路特点**：
- **Public Client** 只读（余额、区块、读合约、监听事件）
- **Wallet Client** 只写（签名、发交易）
- `getContract` 可同时绑定 `public` + `wallet` client
- 事件监听：`watchEvent.Transfer({}, { onLogs })` 需要两个参数
- 对 Next.js Server/Client 边界、序列化（bigint）、CORS 等问题暴露更充分，适合深入学习

**关键文件**：
- `components/Viem/ViemPage.tsx`
- `app/viem/actions.ts`（Server Action 示例）
- `app/viem/page.tsx`

---

### 4.3 Wagmi + RainbowKit（`/wagmi`）

**定位**：React 生态的 Web3 方案，hooks 驱动 + 开箱即用的钱包 UI。

**核心技术**：
- `wagmi` v2：React hooks（`useAccount`、`useBalance`、`useWatchContractEvent`）
- `wagmi/actions`：命令式 API（`getBalance`、`sendTransaction`、`readContract`、`writeContract`）
- `@rainbow-me/rainbowkit`：Connect 按钮、钱包选择弹窗
- `@tanstack/react-query`：wagmi 内部状态缓存（必需依赖）
- 底层仍由 **viem** 执行 RPC 与合约交互

**RPC 来源**：
- 当前 config：`custom(window.ethereum)`，走 MetaMask（与 Ethers BrowserProvider 同类）
- 曾尝试 Alchemy `http()` / 公共节点；事件监听对 RPC 质量敏感（filter not found 等）

**思路特点**：
- **UI 层**（RainbowKit）与 **逻辑层**（wagmi）分离
- 连接钱包用 `<ConnectButton />`，无需手写 `eth_requestAccounts`
- 读余额可用 hook `useBalance` 自动响应连接状态
- 事件监听用 `useWatchContractEvent` + `enabled` 开关，符合 React 声明式风格
- Provider 放在 `app/wagmi/layout.tsx`，仅影响 `/wagmi` 路由
- config 在浏览器端 `useEffect` 中创建，避免 `window is not defined`

**关键文件**：
- `components/Wagmi/WagmiPage.tsx`
- `components/Wagmi/providers.tsx`
- `lib/wagmi/config.ts` → `createWagmiConfig()`
- `app/wagmi/layout.tsx`

---

## 5. Next.js 集成差异

|  concern | Ethers | Viem | Wagmi |
|----------|--------|------|-------|
| Server Component | 页面可 async（模拟延迟），逻辑全在 Client | 页面纯渲染，逻辑在 Client；另有 Server Action | 页面纯渲染，Provider 在 layout |
| 函数不能传 Client | 不涉及 | Server Action 返回 string，不传 client 实例 | 不涉及 |
| `window.ethereum` | Client 内直接使用 | Client 内使用；config 不可顶层访问 window | `useEffect` 内创建 config |
| 全局 Provider | 不需要 | 不需要 | `/wagmi` 子 layout 包裹 |
| 依赖体积 | 较小（ethers） | 中等（viem） | 较大（wagmi + RainbowKit + WalletConnect 等） |

---

## 6. 共享约定

- **合约 ABI**：`lib/contracts/MyERC20.json`
- **测试网**：Sepolia（chain id: 11155111）
- **示例地址**：Account2 `0xBAFdb5801EA302aA7d28704c4db470217D321593`
- **ERC20 合约**：`0xc6f1c35b7764916bfb8c89c001f06cb02b1e7721`
- **UI 组件**：shadcn/ui（Card、Button、Input 等）

---

## 7. 选型建议

| 场景 | 推荐 |
|------|------|
| 学习以太坊基础概念（Provider、Signer、Contract） | **Ethers** |
| 需要强类型、细粒度控制、与 viem 生态集成 | **Viem** |
| 快速做 dApp、需要标准钱包 UI、React hooks 开发 | **Wagmi + RainbowKit** |
| Next.js 服务端读链（无 CORS） | **Viem Server Action** 或 Wagmi SSR 配置 |
| 浏览器直连用户钱包 RPC | 三者均可：`BrowserProvider` / `custom(window.ethereum)` / wagmi `custom` transport |
| 最小依赖、教学/demo | **Ethers** 或 **Viem** |
| 生产级 dApp 前端 | **Wagmi + RainbowKit**（或 viem + 自研 UI） |

---

## 8. 学习路径建议

1. **先 `/ethers`**：理解钱包连接、签名、合约调用的一条龙流程。
2. **再 `/viem`**：理解 Public / Wallet Client 分离、TypeScript 类型、Next.js 边界问题。
3. **最后 `/wagmi`**：理解 React 生态封装、hooks 声明式开发、Provider 架构。

三者覆盖的能力相同，换的是抽象层次和工程化程度。对照阅读 `EthersPage.tsx` 与 `ViemPage.tsx`、`WagmiPage.tsx` 中同名功能（如 `handleLinkWallet`、ERC20 transfer、Transfer 监听）效果最好。

---

## 9. 已知坑点备忘

| 问题 | 涉及 Demo | 说明 |
|------|-----------|------|
| 函数不能传给 Client Component | Viem | Server Component 勿传 viem client，用 Server Action 传结果 |
| 浏览器 CORS | Viem | 公共 RPC 在浏览器直连会失败，用 Server Action 或钱包 RPC |
| `balanceOf` 参数传错 | Viem / Wagmi | 应传**用户地址**，不是合约地址 |
| `watchEvent` 参数格式 | Viem | 需两个参数：`watchEvent.Transfer({}, { onLogs })` |
| `@wagmi/core` v3 与 wagmi v2 混用 | Wagmi | actions 应从 `wagmi/actions` 导入 |
| RPC filter not found | Wagmi | 公共 RPC 事件 filter 不稳定，可换 Alchemy 或走钱包 RPC |
| `window is not defined` | Wagmi | config 须在 Client + `useEffect` 中创建 |
| `Window.ethereum` 类型冲突 | Ethers | RainbowKit 依赖已声明 `any`，勿重复 `declare global` |

---

*文档基于当前仓库实现整理，随代码演进可继续更新。*
