import "./App.css";
import { useState, useEffect } from "react";
import { useAccount, connect } from "@cfxjs/use-wallet-react/conflux";
import { hash } from "@ensdomains/eth-ens-namehash";
import {
  public_resolver_address,
  web3domain
} from "./utils/cfx";
import { namehash, labelhash } from "./utils";
import { formatsByCoinType } from "@web3identity/address-encoder";

const domainRoot = ".web3";
const newOwnerAddress = "cfxtest:aak4f159yxde9npgyznpgmrr1may7nctw6juau4bvp";
function App() {
  const account = useAccount();
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const owner = account;
  const duration = 31536000; //1年
  const secret =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const data = [];
  const reverseRecord = true;
  const fuses = 0;
  // 1659467455 is the approximate time of the transaction, this is for keeping block hashes the same
  const wrapperExpiry = 1659467455 + duration;

  const onChangeName = (e) => {
    setName(e.target.value);
  };

  useEffect(() => {
    const label = name.split('.')[0]
    setLabel(label)
  }, [name]);

  const commit = async () => {
    // Submit our commitment to the smart contract
    const commitment = await web3domain.Web3Controller.makeCommitment(
      label,
      owner,
      duration,
      secret,
      public_resolver_address,
      data,
      reverseRecord,
      fuses,
      wrapperExpiry
    );
    const txHash = await web3domain.Web3Controller
      .commitWithName(commitment,labelhash(label))
      // .commit(commitment)
      .sendTransaction({ from: account });
    console.info("txHash", txHash);
  };

  const register = async () => {
    const [price] = await web3domain.Web3Controller.rentPrice(label, duration);
    await web3domain.Web3Controller
      .register(
        label,
        owner,
        duration,
        secret,
        public_resolver_address,
        data,
        reverseRecord,
        fuses,
        wrapperExpiry
      )
      .sendTransaction({ from: account, value: price });
  };

  const getStatus = async () => {
    const status = await web3domain.Web3Controller.labelStatus(label);
    console.info("状态: ", status.toString());
  };

  const showNameList = async () => {
    const list = await web3domain.NameWrapper.userDomains(account);
    console.info("域名列表: ", list);
  };

  const getAge = async () => {
    const minAge = await web3domain.Web3Controller.minCommitmentAge();
    const maxAge = await web3domain.Web3Controller.maxCommitmentAge();
    console.info("最小间隔时间:", minAge?.toString() + "秒");
    console.info("最大间隔时间:", maxAge?.toString() + "秒");
  };

  const getOwner = async () => {
    const result = await web3domain.NameWrapper.ownerOf(hash(name));
    console.info("拥有者", result);
  };

  const transfer = async () => {
    const result = await web3domain.NameWrapper.safeTransferFrom(
      account,
      newOwnerAddress,
      hash(name),
      1,
      "0x"
    ).sendTransaction({ from: account });
    console.info("result", result);
  };

  const setCNSName = async () => {
    const result = await web3domain.ReverseRegistrar
      .setName("abce3.web3")
      .sendTransaction({ from: account });
    console.info("result", result);
  };

  const getName = async () => {
    const result = await web3domain.ReverseRegistrar.node(account);
    const name=await web3domain.PublicResolver.name(result)
    console.info("name",name)
  };

  const getExpires = async () => {
    const result = await web3domain.Web3BaseRegistrar.nameExpires(labelhash(label));
    console.info("result", new Date(Number(result.toString() * 1000)));
  };

  const renew = async () => {
    const [price] = await web3domain.Web3Controller.rentPrice(label, duration);
    const txHash = await web3domain.Web3Controller
      .renew(label, duration)
      .sendTransaction({ from: account, value: price });
    console.info("txHash", txHash);
  };

  const getAddr = async () => {
    const coinTypeInstance = formatsByCoinType[0];
    const inputCoinType = coinTypeInstance.coinType;
    const result = await web3domain.PublicResolver.addr(
      namehash(name),
      inputCoinType
    );
    console.info("result", coinTypeInstance.encoder(result));
  };

  const setAddr = async () => {
    const coinTypeInstance = formatsByCoinType[0];
    const inputCoinType = coinTypeInstance.coinType;
    console.info('inputCoinType',inputCoinType)
    //set bitcoin address
    const address = "3HjgXRAs88Kdo19eQSpmDoiardRDB2AV4c";
    const encodedAddress = coinTypeInstance.decoder(address);
    console.info('encodedAddress',encodedAddress)
    const result = await web3domain.PublicResolver
      .setAddr(hash(name), inputCoinType, encodedAddress)
      .sendTransaction({ from: account });
    console.info("result", result);
  };

  const getCfxAddr = async () => {
    const coinTypeInstance = formatsByCoinType[503];
    const inputCoinType = coinTypeInstance.coinType;
    const result = await web3domain.PublicResolver.addr(
      namehash(name),
      inputCoinType
    );
    console.info("result", coinTypeInstance.encoder(result));
  }

  const setCfxAddr = async () => {
    const address = 'cfx:aak86utdktvnh3yta2kjvz62yae3kkcu1yzbpza8rb';
    const coinTypeInstance = formatsByCoinType[503];
    const inputCoinType = coinTypeInstance.coinType;
    const encodedAddress = coinTypeInstance.decoder(address);
    const result = await web3domain.PublicResolver
      .setAddr(hash(name), inputCoinType, encodedAddress)
      .sendTransaction({ from: account });
    console.info("result", result);
  }

  return (
    <div className="App">
        <button onClick={connect}>连接钱包</button>
        <span>钱包地址:{account}</span>
        <article>
          <div>
            <input
              onChange={onChangeName}
              width="w-full"
              placeholder="请输入域名,比如 abcde.web3"
              maxLength="20"
              value={name}
              id="pKeyGroupName"
            />
            <span>请输入正确的域名，如abcd.web3</span>
          </div>
          <button onClick={getAge}>
            第一步: 获取并知悉 申请注册 - 注册 之间的 间隔时间
          </button>
          <button onClick={commit}>第二步: 申请注册</button>
          <button onClick={register}>第三步: 注册(cfx)</button>
          <button onClick={getStatus}>获取name的注册状态</button>
          <button onClick={showNameList}>获取钱包账户的域名列表</button>
          <button onClick={getOwner}>获取某个地址的owner</button>
          <button onClick={transfer}>转让</button>
          <button onClick={getName}>获取反向记录</button>
          <button onClick={setCNSName}>设置反解析(setName)</button>
          <button onClick={getExpires}>获取域名到期时间</button>
          <button onClick={renew}>续费1年</button>
          <button onClick={getAddr}>地址解析-获取btc地址</button>
          <button onClick={setAddr}>地址解析-设置btc</button>
          <button onClick={getCfxAddr}>地址解析-获取cfx地址</button>
          <button onClick={setCfxAddr}>地址解析-设置cfx</button>
        </article>
      <div></div>
    </div>
  );
}

export default App;
