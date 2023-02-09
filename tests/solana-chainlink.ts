import * as anchor from "@project-serum/anchor";
import { Program, BN } from "@project-serum/anchor";
import { SolanaChainlink } from "../target/types/solana_chainlink";

const assert = require("assert");

const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";
// SOL/USD feed account
const CHAINLINK_FEED = "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR";
const DIVISOR = 100000000;

describe("solana-chainlink", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.SolanaChainlink;

  it("Query SOL/USD Price Feed!", async () => {
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;

    //create an account to store the price data
    const priceFeedAccount = anchor.web3.Keypair.generate();

    // Execute the RPC.
    let tx = await program.rpc.execute({
      accounts: {
        decimal: priceFeedAccount.publicKey,
        user: publicKey,
        chainlinkFeed: CHAINLINK_FEED,
        chainlinkProgram: CHAINLINK_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      options: { commitment: "confirmed" },
      signers: [priceFeedAccount],
    });

    // Fetch the account details of the account containing the price data
    const latestPrice = await program.account.decimal.fetch(
      priceFeedAccount.publicKey
    );
    console.log("Price Is: " + latestPrice.value / DIVISOR);

    // Ensure the price returned is a positive value
    assert.ok(latestPrice.value / DIVISOR > 0);
  });
});
