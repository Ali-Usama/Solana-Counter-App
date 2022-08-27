import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MySolanaApp } from "../target/types/my_solana_app";
import * as console from "console";
const { SystemProgram } = anchor.web3;
import * as assert from "assert";

describe("mySolanaApp", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.MySolanaApp as Program<MySolanaApp>;

    let base_Account = anchor.web3.Keypair.generate();
    it("Initializing the account!", async () => {
        // Add your test here.
        // const base_Account = anchor.web3.Keypair.generate();
        const tx = await program.methods.initialize("Hello World").accounts(
            {
                baseAccount: base_Account.publicKey,
                user: provider.wallet.publicKey,
                systemProgram: SystemProgram.programId,
            }
        ).signers([base_Account])
            .rpc();

        const account = await program.account.baseAccount.fetch(base_Account.publicKey);
        console.log("Data: ", account.data);
        console.log("1st pubkey: ", base_Account.publicKey);
        assert.ok(account.data == "Hello World");
        // _base_Account = base_Account;
        console.log("Your transaction signature", tx);
    });

    it("Updates a previously created account!", async () => {
        // const base_Account = _base_Account;
        const tx = await program.methods.update("Some new data").accounts(
            {
                baseAccount: base_Account.publicKey,
            }
        ).rpc();

        const account = program.account.baseAccount.fetch(base_Account.publicKey);
        console.log("Updated data: ", account.dataList);
        console.log("2nd pub key: ", base_Account.publicKey);
        console.log("Your transaction signature ", tx);
        assert.ok(account.dataList.length == 2);
    });
});
