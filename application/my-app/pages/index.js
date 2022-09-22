import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import {useEffect, useRef, useState} from "react";
import {WHITELIST_CONTRACT_ADDRESS, abi} from "../constants";


export default function Home() {
  // walletConnected keep track of whether the users wallet is connected
  const [walletConnected, setWalletConnected] = useState(false);
  // joinedWhitelist keeps track of whether the current metamask address has joined the Whitelist or not 
  const [joinedWhitelist, setJoinedWhiteist] = useState(false);
  // Loading is set to true when we are waiting for a transaction to be finished mining
  const [loading, setLoading] = useState(false);
  // numOfWhitelisted tracks the num of addresses that are whitelisted
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0); 
  // Create a reference to web3 modal to connect to metamask 
  const web3ModalRef = useRef();

 /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc., which can only read
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions. Which can read and write
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */

const getProviderOrSigner = async (needSigner = false) => {
  // Connecting to metamask 
  // Storing web3modal and now we need to access the current value to get access to the underlying object
  const provider = await web3ModalRef.current.connect();
  //let provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const web3Provider = new providers.Web3Provider(provider);

  // If user is not connected to goerli network let them know 
  const {chainId} = await web3Provider.getNetwork(); 
 
  if (chainId !== 5) {
    window.alert("Change to the Goerli test network pleaszzz");
    throw new Error("Change to Goerli test newtork plzz");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider; 

}; 


// Add the current connected address to the whitelist 

const addAddressToWhitelist = async () => {
  // Need a signer since this is a write transaction 
  try {
    const signer = await getProviderOrSigner(true);
    
    // Create a new instance of the Contract with a Signer which updates the method 
    const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer); 

    // Call the addAddressToWhitelist from the contract 
    const tx = await whitelistContract.addAddressToWhitelist();
    setLoading(true);
    
    // Wait for tx to be mined
    await getNumOfWhitelisted();
    setJoinedWhiteist(true);
  } catch(err) {
    console.error(err); 
  }
}; 

//getNumOfWhitelisted gets the number of whitelisted addresses

const getNumOfWhitelisted = async() => {
  try {
    // Get the provider from metamask
    const provider = await getProviderOrSigner();

    // Connected to the contract via provider so we will have read only access
    const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider);

    // Call the numAddressesWhitelisted from the Contract 
    const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
    setNumOfWhitelisted(_numberOfWhitelisted);
  } catch (err){
    console.error(err); 
  }
};

// Check IFAddressInWhitelist: Checks if the address is in the whitelist 

const checkIfAddressInWhitelist = async() => { 
  // Even though this is a read transcation, since signers are special kinds of providers, 
  // we can use it in it's place 
  try { 
  const signer = await getProviderOrSigner(true);
  const whitelistContract = new Contract (
    WHITELIST_CONTRACT_ADDRESS,
    abi,
    signer,
  );
  // Get the address associated to the signer which is connected to MetaMask
  const address = await signer.getAddress();
  // call the whistelistedAddress from the contract 
  const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
  setJoinedWhiteist(_joinedWhitelist);
  } catch (err) {
    console.error(err);
    }
  };

// Connect the wallet to metamask 
const connectWallet = async() => {
  try {
    //get provider from web3Modal which is metamask
    //When used for the first tiem, it prompts the user to connect their wallet

    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressInWhitelist();
    getNumOfWhitelisted();
  } catch (err){
    console.error(err);
  }
};   

const renderButton = () => {
  if (walletConnected){
    if (joinedWhitelist){
      return(
        <div className = {styles.description}>
          Thanks for joining the whitelist!
        </div>
      );
    } else if (loading) {
      return(
        <button className = {styles.button}>
          Loading...
        </button>
      );
    } else {
      return(
        <button onClick = {addAddressToWhitelist} className={styles.button}>
          Join the waitlist
        </button>
      );
    }
  } else {
    return(
      <button onClick={connectWallet} className={styles.button}>
        Join the waitlist
      </button>
    );
  }
};

//useEffects are used to react to change in state of the website
//The array at the end of functional cal represents what state changes will this effect
//Whenever the value of walletConnected changes - this effect will be called

useEffect(() => {
  //if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet 
  if(!walletConnected){
    //Assign the web3Modal class to the reference object by setting its current value
    //The current cvalue is persisted throughout as long as this page is open 
    web3ModalRef.current = new Web3Modal({
      network: "goerli",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
  }
}, [walletConnected]); 

return (
  <div>
    <Head>
      <title>Whitelist Dapp</title>
      <meta name="description" content="Whitelist-Dapp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className={styles.description}>
          Its an NFT collection for developers in Crypto.
        </div>
        <div className={styles.description}>
          {numOfWhitelisted} have already joined the Whitelist
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg" />
      </div>
    </div>

    <footer className={styles.footer}>
      Made with &#10084; by Crypto Developers like Mike :)
    </footer>
  </div>
);
}