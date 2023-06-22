/* eslint-disable no-undef */
const Mintraribles = artifacts.require('Mintraribles')

module.exports = async (deployer) => {
  const accounts = await web3.eth.getAccounts()

  await deployer.deploy(Mintraribles, 'Mintraribles NFTs', 'MNR', 10, accounts[1])
}