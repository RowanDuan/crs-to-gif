"use client"

import { useEffect } from "react"

export default function SolidityNotes() {
  useEffect(() => {
    //== Start ==
    console.log("== Start ==")
    console.info("this is block 24 3 ")

    //
    // ##################### Hash
    // Hash函数
    // Hash碰撞
    // 密码学hash
    //  - 性质1：Collision Resistance 抗碰撞性
    //  - 性质2：Hiding 隐藏性, 不可逆不可反推 (输入空间足够大 拼接随机数nonce，分布比较均匀)
    //  - 性质3(BTC要求的性质)：Puzzle Friendly 谜题友好性
    // MD5
    // Digital Commitment
    // Sealed Envelope
    // BTC使用：SHA-256，全称是Secure Hash Algorithm 256，是一种密码学hash函数，用于生成btc的区块哈希。
    // #####################
    // ##################### 签名
    // A -r()-> B, B:f(xxxxxx)->str, B --str--> A, A:r(str)
    //    C:r()                      C:str->str2   A:r(str2)
    // BTC数据结构 链表结构
    // 区别于普通链表数据，每个数据的key是一个Hash指针
    // Hash指针 pointers
    // P --> xxx <-- H()
    // 口-口-口-口-口-口-口-口
    //   <-H()
    // Merkle tree, 每个数据的key是一个Hash指针, 区别于普通树结构binary tree
    // Block Header, Block Body
    // Merkle Proof 证明？
    //

    //
    // #####################
    // 如何理解树种的“某个交易（叶子节点）”，已知我拥有一个Root Hash（是由所有节点算出），那么“某个交易”新生成时，这难道不是会导致Root Hash发生变化吗？
    // Merkle tree中的Merkle Proof是如何被证明的？如何理解？比如A想我转一笔钱，我如何证明我收到了这笔钱，这笔钱转去哪了？
    // 假设现在是在BTC区，上述“证明那笔转出交易已上链”中说的“链”是不是指BTC中最大那个链？也就是独有唯一的链？所有人都跟这个链有关系？
    // P2P网络
    // 成本极高
    //

    //
    // #####################
    // shuzirenminbi 017 092 0017xiaozhen
    // quzhongxinhua jiejuedewenti
    // gongsidaodizaimouhuashenme
    // faxing / yanzhengjiaoyideyouxiaoxing
    // shuilaifaxinghuobi
    // zhubiquan const name = 'xiaoming'
    // double spending
    // bimianzhegewenti meige jiaoyi shuru he shuchu shurubufen b de laiyuan
    // a degongyao geichu zhuangeishuizhuanchugeishuigeishui
    // jiaoyide bshi nalaide const name = 'xiaoming'

    //
    // #####################
    // Block Herder:
    //  - 宏观信息
    //  - 版本协议
    //  - 指向前一个区块的hash指针
    //  - 整个Merkle tree的root hash
    //  - 两个阈: 难度阈值, 随机数nonce
    //  - 目标阈值编码
    //  - 时间戳？
    // Block Body:
    //  - 交易列表
    //  - hash指针(指向header整体)
    //

    //
    // ##################### BTC协议
    // 共识协议
    // 记账权 铸b权 BTC
    // 共识机制
    // fenbushi haxi biao gongshi
    // 争夺记账权就是常说的wakuang
    //

    //
    // ##################### BTC具体实现
    // BTC其实就是个去中心化的账本
    // 账本模式
    // UTXO 未花费交易输出的集合
    // 每个交易都是一个UTXO，每个UTXO都有一个唯一的hash指针
    // 每个UTXO都有一个唯一的hash指针
    // node transaction free
    // BTC/块: 2026: 3.125, 2028: 1.5625
    //

    //
    // ##################### wk的概率分析
    // wk就是不停的尝试nonce是否正确, 直到找到一个正确的nonce, 然后就获得记账权
    // 出块时间
    // btc总量: 210000*50=10,500,000
    // 21w x 50 x (1 + 1/2 + 1/4 + 1/8 + ... +1/n)
    // = 1050w x (1-1/n) = 1050w x 2(无限接近2)
    // = 无限趋近于 2100w
    //
    // ##################### Safe
    // 防止double-spending: 等待6个confirmation, 即1小时左右, 就认为交易是安全的
    //
    // ##################### ETH
    // WK Suanfa: ethash
    // premining
    //
    // ##################### 难度调整
    // ##################### 权益证明
    // langfeidian
    // theDAO

    // 签名(r, s) = 签名算法( 私钥, 交易内容T )
    // 验证结果 = 验证算法( 签名S, 交易内容T, 公钥 ), 返回 true 或 false
    //  私钥 * G => G2
    // d	私钥（一个保密的大整数）	只有签名者
    // P	公钥，P = d * G	全网公开
    // G	椭圆曲线的生成点（公开常数）	全网公开
    // z	交易内容的哈希值（即 SHA-256(T)）	全网公开
    // k	临时随机数（nonce），每次签名重新生成	签名者生成，需要保密
    // (r, s)	签名对	广播出去
    //
    // R = k * G          (1) 用随机数 k 乘以椭圆曲线上的基点 G，得到曲线上的一个点 R
    // r = R 的 x 坐标    (2)
    // s = k + (r * d)  (mod n)      (3) 其中 n 是椭圆曲线的阶（一个很大的质数，模运算保证结果不溢出）
    // ==> (r, s)
    // d = (s - k) / r   (mod n)
    // Validate:
    // s * G公开  =  r + (P * z)
    // 左边：s * G = (k + r*d) * G = k*G + r*(d*G) = R + r*P
    // 右边：r + (P * z) 这里的 + 是椭圆曲线上的点加，P * z 也是点乘。
    // 实际上，Schnorr 验证的完整正确写法是：
    // s * G = R + (P * z)  ，其中 R 由 r 重建（因为 r 是 R 的 x 坐标）
    // 为了简化写成 r + (P * z)，但严格来说 r 在这里代表 R 这个点。

    // 总结：
    // 存在一个恒等式 s*G = r + P*z。
    // 给定固定的 P（公钥）和 z（交易哈希），只有知道私钥 d（满足 P = d*G）的人，
    // 才能计算出正确的 (r, s) 使得该等式成立。
    // 任何不知道 d 的人，即使看到 (r, s)，也无法为不同的 z' 伪造出新的 (r', s')。

    // 也可以这么说：
    // 存在一个恒等式 s*G = r + P*z。
    // 对于固定的 P（公钥）和 z（交易哈希），只有知道私钥 d（满足 P = d*G）的人，
    // 才能计算出满足该等式的 (r, s)。
    // 验证者通过检查这个等式，就能确信签名者确实知道 d，而无需知道 d 本身。
    //
    // 也就是同一个人比如小明，可以更换不同的k，算出不同的（r，s），
    // 并且这些不同的（r，s）带入到这个给定的s*G = r + P*z式子里始终会成立，
    // 这样就能证明这个式子是小明生成的，小明有生成它的秘钥。

    // BTC nerwork
    //
    // make sense
    // 私钥 --椭圆曲线算法，secp256k1--> 公钥 --Hash(公钥)--> 地址
    //
    // 多学科交叉领域。价值互联网。
    //

    // 20260615
    // GAS

    // 不可篡改、自动执行、公开透明
    // 1 ether = 10^9 gwei = 10^18 wei
    // 关键字:
    // // SPDX-License-Identifier: MIT              // 许可证标识符
    // pragma solidity                              // 允许的版本号
    // pragma solidity ^0.8.0;                      // 写法示例；^ 表示兼容该小版本及以上
    // contract  声明合约
    // string    声明字符串
    // public    用于变量：声明公共变量，自动生成 getter，外部可访问
    // public    用于函数：函数时表示内部和外部都可调用
    // pure   声明纯函数 不读 不修改 不写 变量（storage、msg、block 等），只做纯计算
    // private  声明私有变量，仅当前合约内可访问，子合约也不可访问
    // constructor 合约构造函数 仅在部署时执行一次 可传参
    // function 声明一个函数
    // view 表示视图函数 仅查询变量 不修改变量
    // returns 函数返回值
    // memory 表示参数临时存储，函数执行结束后释放；引用类型（string/bytes/数组/struct），函数内常用
    // storage  持久存储在链上，状态变量默认 storage；函数参数也可标记 storage 表示引用状态变量
    // msg { sender value data sig }
    //   - msg.sender 调用者地址；
    //   - value 随交易携带的 wei；
    //   - data 完整 calldata；
    //   - sig 是 data 前 4 字节（函数选择器），函数选择器是函数签名的哈希前4字节
    // calldata
    //   - 表示函数的参数为临时数据 只读 不可变 不存储
    //   - external 函数的外部参数常用
    //   - 比 memory 更省 gas
    // uint uint[] 声明无符号整数，默认 uint256；uint[] 是动态数组
    // for 循环  for (uint i = 0; i < 10; i++) {}
    // external  表示该函数 主要给外部账户/合约调用；合约内部应写 this.f() 调用，不能直接 f()
    // internal  表示该函数 当前合约及子合约可调用；比 public 省 gas，外部不能直接调
    // constant  声明常量，编译时确定, 不能修改
    // immutable
    //   - 声明常量，可在部署时确定, 不能修改
    //   - 在 constructor 里赋值一次，之后只读
    //   - 比 constant 适合部署时才能确定的值
    // unchecked 表示函数不检查溢出 节省gas 一般不用，需谨慎使用，仅在追求极致gas时使用
    // payable
    //   - 用于函数：表示该函数可以接收以太币（msg.value）；
    //   - 用于地址变量：address payable 类型可配合 .transfer/.send 使用
    //   - payable { balance }  { 金额 }
    //   - payable(msg.sender).transfer(amount);  // 转账给调用者本人
    //   - to.transfer(amount);  // 转账给指定地址to, to来自函数参数，比如 (address payanle to)
    // address 声明一个地址变量
    //   - address(this) 当前合约的地址
    //   - address(this).balance  当前合约持有的 ETH 余额（单位 wei）；msg.value 是本次调用转入的金额
    //   - address(this).balance  当前合约 ETH 余额；普通 address 需先 payable 或用 call 转 ETH
    // address(0) 表示零地址 0x0000000000000000000000000000000000000000
    // tx.origin
    //   - 交易发起者的地址（最原始的调用者）
    //   - 整个调用链最外层 EOA；有钓鱼风险，鉴权优先用 msg.sender 而非 tx.origin
    // receive() external payable  专门接收纯 ETH 转账（calldata 为空且无匹配的函数时触发）
    // fallback() external payable  无匹配函数或 receive 不存在时触发；可处理未知 calldata
    // recipient.transfer
    //   recipient.transfer(amount)
    //   recipient.send(amount)
    //   recipient.call{value: amount}("")
    // transfer  固定转发, 2300 gas，失败会 revert；send  同样 2300 gas，失败返回 false；call  转发可用 gas，返回 (bool, bytes)
    // require
    //   - 判断条件是否满足，不满足则抛出错误 并终止函数执行 并退回剩余 gas；常用于输入校验和权限检查
    //   - 示例：require(balanceOf[msg.sender] > 0, "Insufficient balance");
    // (bool success, bytes memory data) = addr.call{value: amount}("");
    //   - 解构赋值；
    //   - success 表示是否成功
    //   - data 是返回数据
    // bytes1 ~ bytes32  固定长度字节数组；
    // bytes  动态字节数组（类似 bytes 动态版）
    // keccak256(data) 常用哈希函数，返回 bytes32；可用于 id、commitment、事件 topic 等
    // enum 枚举本质是uint8，比使用string存储状态更省gas。
    // enum 编译器会选能容纳的最小整数类型（不一定是 uint8）；比 string 存状态更省 gas
    // type
    //   type(uint8).max,   // 255
    //   type(uint8).min,   // 0
    //   type(int8).max,    // 127
    //   type(int8).min     // -128
    // indexed
    //   - 事件参数标记；
    //   - 普通事件最多 3 个 indexed（topic[0] 是事件签名哈希）；
    //   - anonymous 事件最多 4 个 indexed
    // anonymous
    //   - 匿名事件
    //   - 不把事件签名放进 topic[0]，省 gas；
    //   - 但过滤器不能按事件名订阅，只能按 indexed 参数
    // block 当前区块
    //   block {
    //      timestamp 时间戳
    //      number 区块号
    //      blockHash() 区块哈希
    //      difficulty 区块难度
    //        - 合并后（PoS）基本废弃；新区块可用 block.prevrandao 作随机源（仍非真随机）
    //      chainid 链id
    //      coinbase 矿工地址
    //      gaslimit 区块最大gas限制
    //      basefee 区块基础费用
    //  }
    // mapping
    //   - 声明一个映射  key-value 键值对
    //   - 示例：mapping(address => uint256) balanceOf
    //   - 无法遍历所有 key
    //   - 未赋值 key 默认是零值（如 uint 为 0）
    // struct
    //   - 声明一个结构体，类似JS中的对象
    //   - 示例：struct User { string name; uint256 age; }
    //   - 由于默认值(比如uint256 age默认为0)不好判断结构体是否存在
    //   - 通常使用 exists 判断结构体是否存在：struct User { bool exists }，实例化后设置为 true
    // bool 声明一个布尔值
    // ether 1ether 表示1个以太币 1ether = 10^9 gwei = 10^18 wei
    // modifier
    //   - 声明一个修饰函数 在函数执行前或后执行一些代码，可传参
    //   - 函数中使用 _; 表示插入被修饰函数体
    //   - 示例：
    //      - modifier onlyOwner() {
    //          require(msg.sender == owner, "Not owner");
    //          _;
    //        }
    // if () {} else if () {} else {} if语句，用法同JS
    // while () {} while循环，用法同JS
    // xxx ? xx : xx 三元运算符，用法同JS
    // require / assert / revert(0.8.4+) 判断是否满足条件
    // require  用户输入/外部条件校验；assert  内部不变量（0.8.x 失败会 panic）；revert CustomError()  自定义错误更省 gas
    // error 声明一个错误
    // error InsufficientBalance(uint256 available, uint256 required);  配合 revert InsufficientBalance(...) 使用
    // gasleft() 获取当前gas剩余量

    // abi.encode() ？？
    // abi.encode(a,b,...)  标准 ABI 编码；abi.encodePacked  紧凑编码（哈希常用）；abi.decode(data,(types))  解码
    // abi.encodeWithSelector(selector, args...)  带函数选择器的编码，低层 call 常用

    // ERC20 一个合约标准
    // balanceOf(owner) ERC20内置函数？
    // balanceOf(address) view returns (uint256)  查询某地址 token 余额
    // approve(spender, amount) ERC20内置函数？
    // approve(spender, amount)  授权 spender 可代扣 amount；常配合 transferFrom 使用
    // transferFrom(from, to, amount) ERC20内置函数？
    // transferFrom(from, to, amount)  在 allowance 允许范围内，从 from 转 token 到 to
    // Transfer ERC20内置函数？
    // require / assert / revert(0.8.4+) 判断是否满足条件
    // error 声明一个错误
    // gasleft() 获取当前gas剩余量
    // abi.encode() ？？

    // ERC20 一个合约标准
    // balanceOf(owner) ERC20内置函数？
    // approve(spender, amount) ERC20内置函数？
    // transferFrom(from, to, amount) ERC20内置函数？
    // transfer(to, amount)  标准 ERC20 函数：调用者把自己的 token 转给 to
    // mint 不是 ERC20 标准必带函数；很多项目扩展才有（如 OpenZeppelin ERC20 需 _mint 内部实现）
    // burn ERC20内置函数？
    // burn  同样非标准必带；扩展实现用于销毁 token
    // allowance(owner, spender) view  查询 owner 授权给 spender 的额度
    // virtual 表示该函数可被重写
    // override 表示重写父类函数 需要父级函数有 virtual 标识
    // abstract contract 抽象合约 抽象类 不能实例化 只能继承，可含未实现的函数；子类必须实现后才能部署
    // interface 声明接口? 用法是：？
    // interface
    //   - IERC20 { function balanceOf(address) external view returns (uint256); }
    //   - 只声明函数签名，不含实现；合约继承后必须实现
    // OpenZeppelin 最常用的合约库
    // using for
    //   - 表示继承方法
    //   - 示例：using SafeERC20 for IERC20;  把 library 函数绑定到某类型，可写 token.safeTransfer(...)
    // library
    //   - 声明一个合约库
    //   - 类似工具库，函数多为 internal；部署后 code 可被多个合约 delegatecall 复用
    // import 引入外部库，用法类似JS的import
    // event 声明一个事件
    // emit
    //   - 触发一个事件 并在链上广播并记录日志
    //   - 事件写入日志，链下/indexer 可监听，不修改 storage 状态本身
    //   - 示例：emit Transfer(msg.sender, to, amount);
    // try xxxxx catch () {}
    //   - 仅调用外部使用, try后跟函数，用法区别于JS
    //   - 仅适用于 external 调用或 new 合约创建；内部 call 不能用 try/catch
    //   - 示例：try externalContract.foo() returns (uint x) {
    //           ...
    //          } catch Error(string memory reason) {
    //           ...
    //          } catch (bytes memory lowLevelData) {
    //           ...
    //          }
    // call
    //   - 可交易的地址可调用的方法
    //   - 低级调用：addr.call(abi.encodeWithSignature("foo(uint256)", arg))
    //       - 返回 (bool success, bytes memory data)
    // delegatecall
    //   - 在「当前合约上下文」执行目标合约代码（storage/msg.sender/msg.value 都属于调用方）；
    //   - 代理合约常用
    // staticcall
    //   - 低级只读调用，目标函数必须是 view/pure，不能改状态；
    //   - 适合读外部合约 view 函数
    // ...
    // ...
    // ...
    // 其他小记
    // 转eth出去：
    //   - payable(user).transfer(amount);
    //   - 或
    //   - user.call{value: amount}("");
    // 判断字符串长度:
    //   - string public text;
    //   - require(bytes(text).length > 0, "Text is empty");
    // 字符串对比:
    //   - keccak256(bytes(str1)) == keccak256(bytes(str2))
    // 字符串转化:
    //   - 字符串转bytes: bytes(str);
    //   - bytes转字符串: string(data);
    // ...
    // ...
    // assembly / ecrecover / recoverSigner
    // keccak256(abi.encodePacked(_account, _tokenId))
    // ...
    // ...
    // ...
    // 值类型不写存储方式: uint256, bool, address
    // 引用型必须写存储方式: string, bytes, array, struct | memory / calldata / storage
    // constructor 的参数不能用 calldata（语言限制）
    // calldata一般用于external函数
    //

    //
    console.log("== End ==")
    //== End ==
  }, [])

  return <h3 className="text-lg font-semibold text-zinc-900">Block Page 24</h3>
}
