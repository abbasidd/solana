import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, toBigNumber } from "@metaplex-foundation/js";
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import secret from './id.json';
// const QUICKNODE_RPC = 'https://api.devnet.solana.com';

const QUICKNODE_RPC = 'http://localhost:8899';
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);

const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));

// const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
//     .use(keypairIdentity(WALLET))
//     .use(bundlrStorage({
//         address: 'https://devnet.bundlr.network',
//         providerUrl: QUICKNODE_RPC,
//         timeout: 60000,
//     }));

    const METAPLEX = new Metaplex(SOLANA_CONNECTION);
    METAPLEX.use(keypairIdentity(WALLET))
    // METAPLEX.use(WALLET);

    const CONFIG = {
        imgName: 'Hybot #3618',
        symbol: 'Hybots',
        sellerFeeBasisPoints: 500,//500 bp = 5%
        creators: [
            { address: WALLET.publicKey, share: 100 },
        ],
        metadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/3618.json'
    };



    async function mintProgrammableNft(
        metadataUri: string,
        name: string,
        sellerFee: number,
        symbol: string,
        creators: { address: PublicKey, share: number }[]
    ) {
        console.log(`Minting pNFT`);
        try {
            const transactionBuilder = await METAPLEX
            .nfts()
            .builders()
            .create({
                uri: metadataUri,
                name: name,
                sellerFeeBasisPoints: sellerFee,
                symbol: symbol,
                creators: creators,
                isMutable: true,
                isCollection: false,
                tokenStandard: TokenStandard.ProgrammableNonFungible,
                ruleSet: null
            });
            let { signature, confirmResponse } = await METAPLEX.rpc().sendAndConfirmTransaction(transactionBuilder);
            if (confirmResponse.value.err) {
                throw new Error('failed to confirm transaction');
            }
            const { mintAddress } = transactionBuilder.getContext();
            console.log(`   Success!🎉`);
            console.log(`   Minted NFT: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`);
            console.log(`   Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        }
        catch (err) {
            console.log(err);
        }
    }


    mintProgrammableNft(
        CONFIG.metadata,
        CONFIG.imgName,
        CONFIG.sellerFeeBasisPoints,
        CONFIG.symbol,
        CONFIG.creators
    );