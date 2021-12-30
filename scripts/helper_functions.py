from brownie import accounts, config, network
from web3 import Web3

AVALIABLE_BLOCKCHAIN_ENVIRONMENTS = ["ganache", "development"]
INFURA_IPFS_URL = "https://ipfs.infura.io:5001/api/v0/cat/{}"


def getAccount():
    if network.show_active() in AVALIABLE_BLOCKCHAIN_ENVIRONMENTS:
        print(network.show_active())
        print(accounts)
        ochst = accounts.load("ochst")
        print(ochst)
        return ochst
    return accounts.add(config["wallets"]["private_key"])
