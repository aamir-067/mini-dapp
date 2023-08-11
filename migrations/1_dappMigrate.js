var Dapp = artifacts.require("Dapp");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(Dapp);
};
