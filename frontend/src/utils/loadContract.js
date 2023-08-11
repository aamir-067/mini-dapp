import { Web3 } from 'web3';
let DepContract, address, accounts, web3, isDeployee = false;
const deployContract = async ({ abi, bytecode, provider }) => {
    try {
        web3 = new Web3(provider);
        accounts = await web3.eth.getAccounts();
        // const chainID = await web3.eth.net.getId();
        const Contract = new web3.eth.Contract(abi);
        let gasPrice = await web3.eth.getGasPrice();
        const deployedContract = await Contract.deploy({
            data: bytecode,
        });
        const gas = await deployedContract.estimateGas();
        const tx = await deployedContract.send({
            from: accounts[0],
            gas: gas,
            gasPrice: gasPrice
        });
        address = await tx.options.address;
        isDeployee = true;
        DepContract = new web3.eth.Contract(abi, address);
        return address;
    } catch (e) {
        console.error('Error deploying contract:', e);
    }
};
const CallFunction = async ({ caller }) => {
    if (isDeployee) {
        try {
            const res = await DepContract.methods.myNum().call({ from: caller });
            return res;
        } catch {
            console.error('User Denied the transection')
            return null;
        }
    }
    else {
        return 'please deployee the contract first'
    }
}

const setMyNum = async ({ caller, value }) => {
    if (isDeployee) {
        try {
            const res = await DepContract.methods.setNum(value).send({ from: caller });
            return res;
        } catch {
            console.error('User Denied the transection');
            return null;
        }
    }
    else {
        return 'please deployee the contract first'
    }
}

const DepositAmount = async ({ caller, amount }) => {
    if (isDeployee) {
        try {
            const res = await DepContract.methods.depositAmount().send({ from: caller, value: amount })
            return res;
        } catch {
            console.error('User Denied the transection');
            return null;
        }
    }
    else {
        return 'please deployee the contract first'
    }
}

const withdrawAmount = async ({ caller, amount }) => {
    if (isDeployee) {
        try {
            const res = await DepContract.methods.withdrawAmount(amount, caller).send({ from: caller })
            return res;
        } catch {
            console.error('User Denied the transection');
            return null;
        }
    }
    else {
        return 'please deployee the contract first'
    }
}


export { deployContract, setMyNum, CallFunction, DepositAmount, withdrawAmount };
