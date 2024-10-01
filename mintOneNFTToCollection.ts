import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import secret from './id.json';

const QUICKNODE_RPC = 'https://api.devnet.solana.com';
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));

// Initialize Metaplex
const METAPLEX = new Metaplex(SOLANA_CONNECTION);
METAPLEX.use(keypairIdentity(WALLET));

// Configuration object
// const CONFIG = {
//     imgName: 'Hybot #3619',
//     symbol: 'Hybots',
//     sellerFeeBasisPoints: 500, // 500 bp = 5%
//     metadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/3619.json',
//     creators: [{ address: WALLET.publicKey, share: 100 }],
// };

const CONFIGS = [
    {
        imgName: 'Hybot #3009',
        symbol: 'Hybots',
        sellerFeeBasisPoints: 500, // 5%
        metadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/3009.json',
        creators: [{ address: WALLET.publicKey, share: 100 }],
        collectionMint: new PublicKey("EVpFzcdAbBUG3jrYJ9LFNfuq8YB92oMTAZ6xFg6MdzGB") // Pass the collection mint address
    },
    {
        imgName: 'Hybot #3620',
        symbol: 'Hybots',
        sellerFeeBasisPoints: 500, // 5%
        metadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/3620.json',
        creators: [{ address: WALLET.publicKey, share: 100 }],
        collectionMint: new PublicKey("EVpFzcdAbBUG3jrYJ9LFNfuq8YB92oMTAZ6xFg6MdzGB") // Same collection mint address
    },
    // Add more NFT configurations as needed
];

// Function to mint an individual NFT that belongs to a collection
async function mintProgrammableNft(
    metadataUri: string,
    name: string,
    sellerFee: number,
    symbol: string,
    creators: { address: PublicKey; share: number }[],
    collectionMint: PublicKey
): Promise<void> {
    console.log(`Minting Programmable NFT...`);
    try {
        const transactionBuilder = await METAPLEX.nfts().builders().create({
            uri: metadataUri,
            name: name,
            sellerFeeBasisPoints: sellerFee,
            symbol: symbol,
            creators: creators,
            isMutable: true,
            isCollection: false,
            tokenStandard: TokenStandard.ProgrammableNonFungible,
            ruleSet: null,
            collection: collectionMint, // Link to the collection mint
        });

        const { signature, confirmResponse } = await METAPLEX.rpc().sendAndConfirmTransaction(transactionBuilder);
        if (confirmResponse.value?.err) {
            throw new Error('Failed to confirm NFT transaction');
        }
        const { mintAddress } = transactionBuilder.getContext();
        console.log(`   Success!🎉`);
        console.log(`   Minted NFT: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`);
        console.log(`   Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } catch (err) {
        console.error(err);
    }
}

// Main function to mint collection and NFT
// async function main(): Promise<void> {
   

//     // if (collectionMint) {
//         await mintProgrammableNft(
//             CONFIG.metadata,
//             CONFIG.imgName,
//             CONFIG.sellerFeeBasisPoints,
//             CONFIG.symbol,
//             CONFIG.creators,
//             new PublicKey("EVpFzcdAbBUG3jrYJ9LFNfuq8YB92oMTAZ6xFg6MdzGB") // Pass the collection mint address
//         );
//     // }
// }

async function mintMultipleNfts() {
    for (const config of CONFIGS) {
        await mintProgrammableNft(
            config.metadata,
            config.imgName,
            config.sellerFeeBasisPoints,
            config.symbol,
            config.creators,
            config.collectionMint
        );
    }
}

// Run the minting process
mintMultipleNfts().catch(console.error);
// Run the main function
// main().catch(console.error);
