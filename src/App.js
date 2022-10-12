import "./App.css";
import { useAccount, connect } from "@cfxjs/use-wallet-react/conflux";
import {hash} from "@ensdomains/eth-ens-namehash"
import { controllerAddressContract as controller,nameWrapperContract,reverseRegistrarContract,baseRegistrarContract,publicResolverContract } from "./utils/cfx";
import { decodeLabelhash,namehash,labelhash } from "./utils";
import {formatsByCoinType} from '@ensdomains/address-encoder'



const label = "abcd2";
const name=label+'.web3'
console.info('hashname',hash(name))
const newOwnerAddress="cfxtest:aak4f159yxde9npgyznpgmrr1may7nctw6juau4bvp"

function App() {
  const account = useAccount();
  console.info('account',account)
  const owner = account;
  const duration = 31536000;
  const secret =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const resolver = "cfxtest:acahw54guhthk9778mxxk5jkn1pjfzbuz6xs73hcb4";
  const data = [];
  const reverseRecord = true;
  const fuses = 0;
  // 1659467455 is the approximate time of the transaction, this is for keeping block hashes the same
  const wrapperExpiry = 1659467455 + duration;

  const commit = async () => {
    // Submit our commitment to the smart contract
    const commitment = await controller.makeCommitment(
      label,
      owner,
      duration,
      secret,
      resolver,
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
    const tx = await controller
      .register(
        label,
        owner,
        duration,
        secret,
        resolver,
        data,
        reverseRecord,
        fuses,
        wrapperExpiry
      )
      .sendTransaction({ from: account, value: price });
  };

  const checkAvail = async () => {
    const status = await controller.labelStatus(label);
    console.info("status", status);
  };

  const showNameList=async()=>{
    const list=await nameWrapperContract.userDomains(account)
    console.info('list',list)
  }

  const getAge=async()=>{
    const minAge=await controller.minCommitmentAge()
    const maxAge=await controller.maxCommitmentAge()
    console.info('minAge',minAge?.toString())
    console.info('maxAge',maxAge?.toString())
  }

  

  const getOwner=async()=>{
    const result=await nameWrapperContract.ownerOf(hash(name))
    console.info('result',result)
  }


  const transfer=async()=>{
    const result=await nameWrapperContract.safeTransferFrom(account,newOwnerAddress,hash(label),1,"0x")
    console.info('result',result)
  }

  const setName=async()=>{
    const result=await reverseRegistrarContract.setName(name).sendTransaction({ from: account })
    console.info('result',result)
  }

  const getName=async()=>{
    const result=await reverseRegistrarContract.node(account)
    console.info('result',decodeLabelhash(result.toString()))
  }

  const getExpires=async()=>{
    const result=await baseRegistrarContract.nameExpires(labelhash(label))
    console.info('result',result.toString())
  }

  const renew=async()=>{
    const [price] = await controller.rentPrice(label, duration);
    const txHash=await controller
      .renew(label,duration)
      .sendTransaction({ from: account, value: price });
    console.info('txHash',txHash)  
  }

  const getAddr=async()=>{
    const result=await publicResolverContract.addr(namehash(name))
    console.info('result',result)
  }

  const setAddr=async()=>{
    const coinTypeInstance=formatsByCoinType[0]
    const inputCoinType = coinTypeInstance.coinType
    const address='3HjgXRAs88Kdo19eQSpmDoiardRDB2AV4c'
    const encodedAddress = coinTypeInstance.decoder(address)
    const result=await publicResolverContract.setAddr(namehash(name),inputCoinType,encodedAddress).sendTransaction({ from: account })
    console.info('result',result)
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={connect}>Connect</button>
        <button onClick={commit}>Commit</button>
        <button onClick={getAge}>GetAge</button>
        <button onClick={register}>Register</button>
        <div>
          <button onClick={checkAvail}>CheckAvail</button>
        </div>
        <button onClick={showNameList}>ShowNameLIst</button>
        <button onClick={getOwner}>获取owner</button>
        <button onClick={transfer}>转让</button>
        <button onClick={getName}>获取反向记录</button>
        <button onClick={setName}>设置反解析(setName)</button>
        <button onClick={getExpires}>获取域名到期时间</button>
        <button onClick={renew}>续费</button>
        <button onClick={getAddr}>获取cfx地址</button>
        <button onClick={setAddr}>地址解析-设置btc</button>
      </header>
      <div>
        <div>account:{account}</div>
      </div>
    </div>
  );
}

export default App;
