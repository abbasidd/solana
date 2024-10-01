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
const CONFIG = {
    collectionName: 'Hybots Collection',
    collectionSymbol: 'HYBOTS',
    collectionMetadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/1978.json', // Update with actual URL
    imgName: 'Hybot #3618',
    symbol: 'Hybots',
    sellerFeeBasisPoints: 500, // 500 bp = 5%
    metadata: 'https://bafybeiby32twojkgbx4x3yhubrvwhzhs2teczqrnhnwlsfbv2digexal4u.ipfs.w3s.link/3618.json',
    creators: [{ address: WALLET.publicKey, share: 100 }],
};

// Function to mint a collection NFT
async function mintCollectionNFT(
    metadataUri: string,
    name: string,
    symbol: string,
    sellerFee: number,
    creators: { address: PublicKey; share: number }[]
): Promise<PublicKey | undefined> {
    console.log(`Minting Collection NFT...`);
    try {
        const transactionBuilder = await METAPLEX.nfts().builders().create({
            uri: metadataUri,
            name: name,
            sellerFeeBasisPoints: sellerFee,
            symbol: symbol,
            creators: creators,
            isMutable: true,
            isCollection: true,
            tokenStandard: TokenStandard.NonFungible,
            ruleSet: null,
        });

        const { signature, confirmResponse } = await METAPLEX.rpc().sendAndConfirmTransaction(transactionBuilder);
        if (confirmResponse.value?.err) {
            throw new Error('Failed to confirm collection transaction');
        }
        const { mintAddress } = transactionBuilder.getContext();
        console.log(`   Success!🎉`);
        console.log(`   Collection Minted: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`);
        console.log(`   Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        return mintAddress; // Return the mint address of the collection
    } catch (err) {
        console.error(err);
    }
}

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
async function main(): Promise<void> {
    const collectionMint = await mintCollectionNFT(
        CONFIG.collectionMetadata,
        CONFIG.collectionName,
        CONFIG.collectionSymbol,
        CONFIG.sellerFeeBasisPoints,
        CONFIG.creators
    );

    if (collectionMint) {
        await mintProgrammableNft(
            CONFIG.metadata,
            CONFIG.imgName,
            CONFIG.sellerFeeBasisPoints,
            CONFIG.symbol,
            CONFIG.creators,
            collectionMint // Pass the collection mint address
        );
    }
}

// Run the main function
main().catch(console.error);
