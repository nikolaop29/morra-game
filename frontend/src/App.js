import "./App.css";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk, { waitForConfirmation } from "algosdk";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useEffect, useState } from "react";

//const crypto = require("crypto");

const peraWallet = new PeraWalletConnect();

// The app ID on testnet
// Morra game app
const appIndex = 175365197;
const appAddress = "I5G5F4LYNPSPCJ6JNIBKNZFS6S4W2B65EWYV3Y6KF3CCDIEVP66L6LOBGY";

// connect to the algorand node
// token, address(server), port
const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  443
);

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [owner, setOwner] = useState(null);
  const [fingers, setFingers] = useState(null);
  const [hashedfingers, setHashedFingers] = useState(null);
  const [realfingers, setRealFingers] = useState(null);
  const [realguess, setRealGuess] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress; //convert string to boolean

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        console.log(accounts);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <Container>
      <meta name="name" content="Morra Game" />
      <h1 class="text-center bg-success text-light">Morra Game</h1>
      <br />
      <Row>
        <Col align="center">
          <Button
            onClick={
              isConnectedToPeraWallet
                ? handleDisconnectWalletClick
                : handleConnectWalletClick
            }
          >
            {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
          </Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col align="center">
          <Button onClick={() => optInApp()}>OptIn</Button>
        </Col>
      </Row>
      <hr/>
      <Row>
        <Col align="right">
          <Button onClick={() => setOwner(true)}>Start Game</Button>
        </Col>
        <Col align="center">
          <Button onClick={() => setOwner(false)}>Join Game</Button>
        </Col>
        <Col align="left">
          <Button onClick={() => resolveApplication()}>Resolve Game</Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col align="right">
        <DropdownButton id="dropdown-basic-button" title="Fingers">
          <Dropdown.Item onClick={() => { setFingers("0"); setHashedFingers("X+zrZv/IbzjZUnhsbWlsecLbwjndTpG0ZynXOif7V+k=");}}>0</Dropdown.Item>
          <Dropdown.Item onClick={() => { setFingers("1"); setHashedFingers("a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=");}}>1</Dropdown.Item>
          <Dropdown.Item onClick={() => { setFingers("2"); setHashedFingers("1HNeOiZeFu7gP1lxi5tdAwGcB9i2xR+Q2jpmbuwTqzU=");}}>2</Dropdown.Item>
          <Dropdown.Item onClick={() => { setFingers("3"); setHashedFingers("TgdAhWK+24tgzgXB3s/jrRa3IjCWfeAfZAt+Rym0n84=");}}>3</Dropdown.Item>
          <Dropdown.Item onClick={() => { setFingers("4"); setHashedFingers("SyJ3d9TdH8Ycb4hPSGQdArTRIdP9Moywi1Ux/Kzav4o=");}}>4</Dropdown.Item>
          <Dropdown.Item onClick={() => { setFingers("5"); setHashedFingers("7y0SfeN7lCuq0GFF5UsMYZofIjJ7LrvPvsePVWSv450=");}}>5</Dropdown.Item>
        </DropdownButton>
        </Col>
        <Col align="left">
        <DropdownButton id="dropdown-basic-button" title="Guess">
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "X+zrZv/IbzjZUnhsbWlsecLbwjndTpG0ZynXOif7V+k=",
                      "0"
                    )
                : () => joinApplication(fingers, "0")
            }>0</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=",
                      "1"
                    )
                : () => joinApplication(fingers, "1")
            }>1</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "1HNeOiZeFu7gP1lxi5tdAwGcB9i2xR+Q2jpmbuwTqzU=",
                      "2"
                    )
                : () => joinApplication(fingers, "2")
            }>2</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "TgdAhWK+24tgzgXB3s/jrRa3IjCWfeAfZAt+Rym0n84=",
                      "3"
                    )
                : () => joinApplication(fingers, "3")
            }>3</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "SyJ3d9TdH8Ycb4hPSGQdArTRIdP9Moywi1Ux/Kzav4o=",
                      "4"
                    )
                : () => joinApplication(fingers, "4")
            }>4</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "7y0SfeN7lCuq0GFF5UsMYZofIjJ7LrvPvsePVWSv450=",
                      "5"
                    )
                : () => joinApplication(fingers, "5")
            }>5</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "5/bAEXdujbfNMwtUF0/Xb30CFrYSOHpf/PuB5vCRloM=",
                      "6"
                    )
                : () => joinApplication(fingers, "6")
            }>6</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "eQJpm+Qsio5G+7tFAXJlF+hrIsVqGJ92JabaSQgbJFE=",
                      "7"
                    )
                : () => joinApplication(fingers, "7")
            }>7</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "LGJCMs3SIXcSlN+7MQrKAAoN9qyLZraW2Q7wb977ZKM=",
                      "8"
                    )
                : () => joinApplication(fingers, "8")
            }>8</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "GVgeJ9587QD/HOULIEfnpWfHaxy666vl7wP3wwF7tbc=",
                      "9"
                    )
                : () => joinApplication(fingers, "9")
            }>9</Dropdown.Item>
          <Dropdown.Item onClick={
              !!owner === true
                ? () =>
                    startApplication(
                      hashedfingers,
                      fingers,
                      "SkTcFTZCBKgP6A6QOUVcwWCCgYIP4rJPHlIzreavHdU=",
                      "10"
                    )
                : () => joinApplication(fingers, "10")
            }>10</Dropdown.Item>
        </DropdownButton>
        </Col>
      </Row>
      <hr/>
    </Container>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountAddress(null);
  }

  async function optInApp() {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();

      const actionTx = algosdk.makeApplicationOptInTxn(
        accountAddress,
        suggestedParams,
        appIndex
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
      alert("You have succesfully opted-in!")
    } catch (e) {
      console.error(`There was an error calling the app: ${e}`);
    }
  }

  async function startApplication(
    hashedfingers,
    fingers,
    hashedguess,
    guess
  ) {
    try {
      setRealFingers(fingers);
      setRealGuess(guess);
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("start")),
        new Uint8Array(Buffer.from(hashedfingers, "base64")),
        new Uint8Array(Buffer.from(hashedguess, "base64")),
      ];

      const accounts = [
        "CTVELZOSWVOSZWSEUP7QP4MJCFBQTWN4VVM3VR7SIYACKKROXA3K2V7ZJE",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        amount: 100000,
        suggestedParams: suggestedParams,
      });

      let txns = [actionTx, payTx];
      algosdk.assignGroupID(txns);

      const actionTxGroup = [
        { txn: actionTx, signers: [accountAddress] },
        { txn: payTx, signers: [accountAddress] },
      ];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      console.log(signedTxns);
      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      alert("You have selected "+fingers+" fingers and guessed the sum of "+guess);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the app: ${e}`);
    }
  }

  async function joinApplication(fingers, guess) {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("accept")),
        new Uint8Array(Buffer.from(fingers)),
        new Uint8Array(Buffer.from(guess))
      ];

      const accounts = [
        "TECJYLEQU22T7YXQT3GY6XYCDQPKPNT6BQEXGPCHJP3OUCO347TRCBCIMU",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      let payTx = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: appAddress,
        amount: 100000,
        suggestedParams: suggestedParams,
      });

      let txns = [actionTx, payTx];
      algosdk.assignGroupID(txns);

      const actionTxGroup = [
        { txn: actionTx, signers: [accountAddress] },
        { txn: payTx, signers: [accountAddress] },
      ];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);

      console.log(signedTxns);
      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      alert("You have selected "+fingers+" fingers and guessed the sum of "+guess);
      // checkCounterState();
    } catch (e) {
      console.error(`There was an error calling the app: ${e}`);
    }
  }

  // RESOLVE WINNER
  async function resolveApplication() {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [
        new Uint8Array(Buffer.from("resolve")),
        new Uint8Array(Buffer.from(realfingers)),
        new Uint8Array(Buffer.from(realguess))
      ];

      const accounts = [
        "CTVELZOSWVOSZWSEUP7QP4MJCFBQTWN4VVM3VR7SIYACKKROXA3K2V7ZJE",
      ];

      let actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs,
        accounts
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTxns = await peraWallet.signTransaction([actionTxGroup]);
      const txns = [signedTxns];

      console.log(signedTxns);

      //const dr = algosdk.createDryrun(algod, txns);

      //test debugging
      //const dryRunResult = await algod.dryrun(dr).do();
      //console.log(dryRunResult);

      const { txId } = await algod.sendRawTransaction(signedTxns).do();
      const result = await waitForConfirmation(algod, txId, 4);
      console.log(result);
    } catch (e) {
      console.error(`There was an error calling the app: ${e}`);
    }
  }

}

export default App;