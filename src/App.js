import "./App.css";
import { useState, useEffect } from "react";
import { useAccount, connect } from "@cfxjs/use-wallet-react/conflux";
import { hash } from "@ensdomains/eth-ens-namehash";
import {
  controllerAddressContract as controller,
  nameWrapperContract,
  reverseRegistrarContract,
  baseRegistrarContract,
  publicResolverContract,
  public_resolver_address,
} from "./utils/cfx";
import { namehash, labelhash } from "./utils";
import { formatsByCoinType } from "@ensdomains/address-encoder";

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
    const commitment = await controller.makeCommitment(
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
    const txHash = await controller
      // .commitWithName(commitment,labelhash(label))
      .commit(commitment)
      .sendTransaction({ from: account });
    console.info("txHash", txHash);
  };

  const register = async () => {
    const [price] = await controller.rentPrice(label, duration);
    await controller
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
    const status = await controller.labelStatus(label);
    console.info("状态: ", status.toString());
  };

  const showNameList = async () => {
    const list = await nameWrapperContract.userDomains(account);
    console.info("域名列表: ", list);
  };

  const getAge = async () => {
    const minAge = await controller.minCommitmentAge();
    const maxAge = await controller.maxCommitmentAge();
    console.info("最小间隔时间:", minAge?.toString() + "秒");
    console.info("最大间隔时间:", maxAge?.toString() + "秒");
  };

  const getOwner = async () => {
    const result = await nameWrapperContract.ownerOf(hash(name));
    console.info("拥有者", result);
  };

  const transfer = async () => {
    const result = await nameWrapperContract.safeTransferFrom(
      account,
      newOwnerAddress,
      hash(label),
      1,
      "0x"
    );
    console.info("result", result);
  };

  const setCNSName = async () => {
    const result = await reverseRegistrarContract
      .setName(name)
      .sendTransaction({ from: account });
    console.info("result", result);
  };

  const getName = async () => {
    //TODO: result需要特殊处理下
    const result = await reverseRegistrarContract.node(account);
    console.info("result", result.toString("hex"));
  };

  const getExpires = async () => {
    const result = await baseRegistrarContract.nameExpires(labelhash(label));
    console.info("result", new Date(Number(result.toString() * 1000)));
  };

  const renew = async () => {
    const [price] = await controller.rentPrice(label, duration);
    const txHash = await controller
      .renew(label, duration)
      .sendTransaction({ from: account, value: price });
    console.info("txHash", txHash);
  };

  const getAddr = async () => {
    const coinTypeInstance = formatsByCoinType[0];
    const inputCoinType = coinTypeInstance.coinType;
    const result = await publicResolverContract.addr(
      namehash(name),
      inputCoinType
    );
    console.info("result", coinTypeInstance.encoder(result));
  };

  const setAddr = async () => {
    const coinTypeInstance = formatsByCoinType[0];
    const inputCoinType = coinTypeInstance.coinType;
    //set bitcoin address
    const address = "3HjgXRAs88Kdo19eQSpmDoiardRDB2AV4c";
    const encodedAddress = coinTypeInstance.decoder(address);
    const result = await publicResolverContract
      .setAddr(namehash(name), inputCoinType, encodedAddress)
      .sendTransaction({ from: account });
    console.info("result", result);
  };

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
          <button onClick={transfer}>转让(todo)</button>
          <button onClick={getName}>获取反向记录(todo)</button>
          <button onClick={setCNSName}>设置反解析(setName)</button>
          <button onClick={getExpires}>获取域名到期时间</button>
          <button onClick={renew}>续费1年</button>
          <button onClick={getAddr}>地址解析-获取btc地址</button>
          <button onClick={setAddr}>地址解析-设置btc</button>
        </article>
      <div></div>
    </div>
  );
}

export default App;
