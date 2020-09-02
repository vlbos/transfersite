// Usage example:
// npm run calculateProof -- /Users/lisheng/Downloads/defi/balancer/erc20-redeemable-master/merkle/test/sampleAllocations  0x77c845E6A61F37cB7B237de90a74fbc3679FcF06  0x77c845E6A61F37cB7B237de90a74fbc3679FcF06

const { MerkleTree } = require("../lib/merkleTree");
const fs = require("fs");
const { loadTrees } = require("./loadTrees");

module.exports = function (callback) {
    console.log("File Path Arg (must be absolute):", process.argv[4]);

    const merkleTree = loadTrees(utils, process.argv[4]);
    const root = merkleTree.getHexRoot();

    const rawdata = fs.readFileSync(process.argv[4]);
    const balances = JSON.parse(rawdata);
    const address = process.argv[5];
    const token = process.argv[6];

    const claimBalance = balances[address];
    console.log("Tree:\t", root);
    console.log("Account:\t", address);
    console.log("Balance:\t", claimBalance);
    const proof = merkleTree.getHexProof(
        utils.soliditySha3(address, token, utils.toWei(claimBalance))
    );
    console.log("Proof:\t", proof);

    console.log("\n\n// TO CLAIM THIS WEEK");
    console.log("let redeem\nMerkleRedeem.deployed().then(i => redeem = i);");
    console.log("\nlet weekNum = 1 // adjust accordingly");
    console.log("\nlet proof = " + JSON.stringify(proof));
    console.log('\nlet claimBalance = web3.utils.toWei("' + claimBalance + '")');

    console.log(
        '\nawait redeem.verifyClaim("' +
        address +
        '", weekNum, token,claimBalance, proof)'
    );
    console.log(
        '\nawait redeem.claimWeek("' + address + '", weekNum, token,claimBalance, proof)'
    );
};

const claimProof = async (utils, admin, contract, address, balances) => {

    let list = [];

    balances.forEach(token => {
        let elements = [];
        let balance = token.balance;
        let leaf = utils.soliditySha3(address, token.token, balance);
        elements.push(leaf);
        const merkleTree = new MerkleTree(elements);
        const root = merkleTree.getHexRoot();
        const proof = merkleTree.getHexProof(elements[0]);
        list.push([token.cycle, token.token, balance, proof]);
    });
    try {
        await contract.methods.claimEpochs(
            address,
            list
        ).send({ from: admin });
    } catch (error) {
    }

    return await contract.methods.claimEpochs(
        address,
        list
    ).encodeABI()
    // myContract.methods.myMethod([param1[, param2[, ...]]]).encodeABI()

}


module.exports = { claimProof };
