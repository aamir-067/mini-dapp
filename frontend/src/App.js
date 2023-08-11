import './App.css';
import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { deployContract, DepositAmount, withdrawAmount } from './utils/loadContract';
import Dapp from 'contracts/Dapp.json';

function App() {
  const [web3Api, setWeb3Api] = useState({ provider: null, web3: null });
  const [accounts, setAccounts] = useState([])
  const [contractDetails, setContractDetails] = useState({ address: null, balance: null });
  const [accBal, setAccBal] = useState(null);
  const [inputData, setInputData] = useState(null);


  // Notes : 
  // 1. all is great but to use it never reject the deployement of the contract else it will not work
  // 2. contract deployement popup only occure in start of the dapp.

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const provider = await detectEthereumProvider();
        if (provider) {
          await provider.request({ method: 'eth_requestAccounts' });
          setWeb3Api({
            provider,
            web3: new Web3(provider),
          });
        }
        else {
          console.error('metamask is not installed');
        }
        await getAccounts();
      } catch (err) {
        console.error(err);
      }
    };
    initializeWeb3();
  }, [web3Api?.provider]);

  useEffect(() => {
    const getContract = async () => {

      try {
        const addr = await deployContract({ abi: Dapp.abi, bytecode: Dapp.bytecode, provider: web3Api.provider });
        let bal = await web3Api.web3.eth.getBalance(addr);
        setContractDetails({ address: addr, balance: bal })
      } catch {
        console.error('user denied the transaction');
      }

    }
    web3Api.provider && getContract();
  }, [web3Api])

  const getAccBal = async () => {
    const getB = await web3Api.web3.eth.getBalance(accounts[0])
    const temp = web3Api.web3.utils.fromWei(getB, 'ether');
    setAccBal(temp)
    console.log('account Balance : ', temp);
  }

  const getContBal = async () => {
    const getB = await web3Api.web3.eth.getBalance(contractDetails.address)
    const temp = web3Api.web3.utils.fromWei(getB, 'ether');
    setContractDetails({ address: contractDetails.address, balance: Number(temp) })

    console.log('account Balance : ', temp);
  }
  useEffect(() => {
    accounts[0] && getAccBal();
    contractDetails.address && getContBal();
  })

  async function getAccounts() {
    if (web3Api.web3) {
      let web3 = web3Api.web3;
      const accs = await web3.eth.getAccounts();
      setAccounts(accs);
    }
  }


  async function deposit(acc) {
    if (inputData) {
      let temp = web3Api.web3.utils.toWei(inputData, 'ether');
      let res = await DepositAmount({ caller: acc, amount: temp });
      await getContBal()
      await getAccBal()
      inputReset();
      console.log('deposit response ==> ', res);
    }
  }


  async function withdraw(acc) {
    if (inputData && inputData < contractDetails.balance) {
      let temp = web3Api.web3.utils.toWei(inputData, 'ether');
      let res = await withdrawAmount({ caller: acc, amount: temp })
      console.log('withdrawal response ==> ', res);
      await getContBal()
      await getAccBal()
      inputReset();

    }
  }

  const inputReset = () => {
    const inp = document.querySelector('.input');
    inp.value = '';
  }
  return (
    <div className="App">
      <nav>
        <h2 className='logo' >AMR</h2>
        <h2 className='heading'>First Dapp</h2>
        <p>{accounts[0] ? accounts[0][0] + accounts[0][1] + accounts[0][2] + accounts[0][3] + accounts[0][4] + '....' : 'not connected'}</p>
      </nav>

      <div className="main">
        <div className="prices">
          <h2 className="wPrice">Contract Price : {contractDetails.balance}</h2>
          <h2 className="aPrice">Account Price : {accBal}</h2>
          <h2 className='aPrice'>Contract Addres is : {contractDetails.address}</h2>
        </div>
        <div className="other">
          <input className='input' type="text" placeholder='Enter Amount' onChange={(e) => {
            const temp = e.target.value
            setInputData(Number(temp));
          }} />
          <div>
            <button onClick={() => {
              withdraw(accounts[0])
            }}>Withdraw Balance</button>
            <button onClick={() => {
              if (accounts[0]) {
                deposit(accounts[0])
              }
              else {
                console.error('deploye contract first');
              }
            }}>Deposit Balance</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
