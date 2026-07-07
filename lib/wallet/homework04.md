# React Web3 钱包连接组件开发任务
## :dart: 教学目标
1. 掌握 React 中 Web3 交互模式
2. 实现多网络配置切换功能
3. 支持 MetaMask、WalletConnect 等主流钱包
4. 封装可复用的 Context 组件
## :pencil: 核心实现步骤
### 1. 创建类型定义
```typescript
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  currencySymbol: string;
}

export interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  installUrl?: string;
}
```
### 2. 创建 Web3 上下文
```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChainConfig, WalletProvider } from '@/types/web3';

interface Web3State {
  account?: string;
  chainId?: number;
  selectedWallet?: string;
}

const Web3Context = createContext<{
  state: Web3State;
  connectWallet: (provider: WalletProvider) => Promise<void>;
  switchChain: (chainId: number) => Promise<void>;
}>(null!);

export function Web3Provider({ children, chains }: { 
  children: React.ReactNode;
  chains: ChainConfig[];
}) {
  const [state, setState] = useState<Web3State>({});
  
  // 监听账户变化
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      setState(prev => ({ ...prev, account: accounts[0] }));
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const connectWallet = async (provider: WalletProvider) => {
    if (provider.id === 'metamask' && !window.ethereum?.isMetaMask) {
      window.open(provider.installUrl, '_blank');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setState({
        account: accounts[0],
        chainId: Number(window.ethereum.chainId),
        selectedWallet: provider.id
      });
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  return (
    <Web3Context.Provider value={{ state, connectWallet, switchChain }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
```

### 3. 钱包连接组件
```tsx
import { useWeb3 } from '@/contexts/Web3Context';
import { ChainConfig, WalletProvider } from '@/types/web3';

const WALLETS: WalletProvider[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    installUrl: 'https://metamask.io/download/'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg'
  }
];

export default function WalletConnector({ chains }: { chains: ChainConfig[] }) {
  const { state, connectWallet } = useWeb3();
  const [selectedChain, setSelectedChain] = useState(chains[0]);

  return (
    <div className="flex gap-4 items-center">
      <select 
        value={selectedChain.id}
        onChange={(e) => setSelectedChain(chains.find(c => c.id === Number(e.target.value))!)}
        className="p-2 border rounded"
      >
        {chains.map(chain => (
          <option key={chain.id} value={chain.id}>{chain.name}</option>
        ))}
      </select>

      {WALLETS.map(wallet => (
        <button
          key={wallet.id}
          onClick={() => connectWallet(wallet)}
          className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
          {wallet.name}
        </button>
      ))}

      {state.account && (
        <div className="ml-4">
          <span>{state.account.slice(0, 6)}...{state.account.slice(-4)}</span>
        </div>
      )}
    </div>
  );
}
```

### 4. 使用示例
```tsx
import WalletConnector from '@/components/WalletConnector';
import { Web3Provider } from '@/contexts/Web3Context';

const chains = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    currencySymbol: 'ETH'
  },
  {
    id: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    currencySymbol: 'BNB'
  }
];

function App() {
  return (
    <Web3Provider chains={chains}>
      <div className="p-8">
        <WalletConnector chains={chains} />
      </div>
    </Web3Provider>
  );
}
```
