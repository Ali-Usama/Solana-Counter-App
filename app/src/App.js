import './App.css';
import {useState} from 'react';
import {Connection, PublicKey} from '@solana/web3.js';
import {Program, web3, AnchorProvider} from '@project-serum/anchor';
import idl from './idl.json';

import {PhantomWalletAdapter} from '@solana/wallet-adapter-wallets';
import {ConnectionProvider, useWallet, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletModalProvider, WalletMultiButton} from '@solana/wallet-adapter-react-ui';

require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
    /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
    new PhantomWalletAdapter()
]

const {SystemProgram, Keypair} = web3;
/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
    preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
    const [value, setValue] = useState('');
    const [dataList, setDataList] = useState([]);
    const [input, setInput] = useState('');
    const wallet = useWallet();

    async function getProvider() {
        /* create the provider and return it to the caller */
        /* network set to local network for now */
        const network = "https://api.devnet.solana.com";
        const connection = new Connection(network, opts.preflightCommitment);

        return new AnchorProvider(
            connection, wallet, opts.preflightCommitment,
        );
    }

    // async function createCounter() {
    //     const provider = await getProvider()
    //     /* create the program interface combining the idl, program ID, and provider */
    //     const program = new Program(idl, programID, provider);
    //     try {
    //         /* interact with the program via rpc */
    //         await program.rpc.create({
    //             accounts: {
    //                 baseAccount: baseAccount.publicKey,
    //                 user: provider.wallet.publicKey,
    //                 systemProgram: SystemProgram.programId,
    //             },
    //             signers: [baseAccount]
    //         });
    //
    //         const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    //         console.log('account: ', account);
    //         setValue(account.count.toString());
    //         console.log("Initial Value: ", account.count.toString());
    //     } catch (err) {
    //         console.log("Transaction error: ", err);
    //     }

    async function initialize() {
        const provider = await getProvider();
        /* create the program interface combining the idl, program ID, and provider */
        const program = new Program(idl, programID, provider);
        try {
            /* interact with the program via rpc */
            await program.methods.initialize("Hello World").accounts(
                {
                    baseAccount: baseAccount.publicKey,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([baseAccount]).rpc();


            const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
            console.log('account: ', account);
            setValue(account.data.toString());
            setDataList(account.dataList);
            console.log("Data: ", account.data.toString());
            console.log("Data List: ", account.dataList);

        } catch (err) {
            console.log("Transaction error: ", err);
        }
    }

    async function update() {
        if (!input) return
        const provider = await getProvider();
        const program = new Program(idl, programID, provider);
        await program.methods.update(input).accounts(
            {
                baseAccount: baseAccount.publicKey
            }).rpc();

        const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
        console.log('account: ', account);
        setValue(account.data.toString());
        setDataList(account.dataList);
        setInput('');
        console.log("Data List: ", account.dataList);
    }


    // async function increment() {
    //     const provider = await getProvider();
    //     const program = new Program(idl, programID, provider);
    //     await program.rpc.increment({
    //         accounts: {
    //             baseAccount: baseAccount.publicKey
    //         }
    //     });
    //
    //     const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    //     console.log('account: ', account);
    //     setValue(account.count.toString());
    //     console.log("Incremented value: ", account.count.toString());
    // }

    if (!wallet.connected) {
        /* If the user's wallet is not connected, display connect wallet button. */
        return (
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '100px'}}>
                <WalletMultiButton/>
            </div>
        )
    } else {
        return (
            // <div className="App">
            //     <div>
            //         {
            //             !value && (<button onClick={createCounter}>Create counter</button>)
            //         }
            //         {
            //             value && <button onClick={increment}>Increment counter</button>
            //         }
            //
            //         {
            //             value && value >= Number(0) ? (
            //                 <h2>{value}</h2>
            //             ) : (
            //                 <h3>Please create the counter.</h3>
            //             )
            //         }
            //     </div>
            // </div>

            <div className="App">
                <div>
                    {
                        !value && (<button onClick={initialize}>Initialize</button>)
                    }

                    {
                        value ? (
                            <div>
                                <h2>Current value: {value}</h2>
                                <input
                                    placeholder="Add new data"
                                    onChange={e => setInput(e.target.value)}
                                    value={input}
                                />
                                <button onClick={update}>Add data</button>
                            </div>
                        ) : (
                            <h3>Please Inialize.</h3>
                        )
                    }
                    {
                        dataList.map((d, i) => <h4 key={i}>{d}</h4>)
                    }
                </div>
            </div>
        );
    }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <App/>
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
)

export default AppWithProvider;
