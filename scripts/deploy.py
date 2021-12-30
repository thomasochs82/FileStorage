import requests
from brownie import config, Storage

from scripts.helper_functions import getAccount, INFURA_IPFS_URL


def storeFile(data):
    files = {"file": data}
    response = requests.post(
        "https://ipfs.infura.io:5001/api/v0/add",
        files=files,
        auth=(config["infura"]["id"], config["infura"]["secret"]),
    )
    fileData = response.json()
    print(fileData)
    return fileData


def get(fileHash):
    params = (("arg", fileHash),)
    response = requests.post(
        "https://ipfs.infura.io:5001/api/v0/cat",
        params=params,
        auth=(config["infura"]["id"], config["infura"]["secret"]),
    )
    return response.text


def deployAndAddFile():
    file = open(r"C:/Users/14695/Dropbox/VSCode/FS/Django/Brownie/hi.txt")
    fileData = storeFile(file)
    print("File stored to IPFS ... Here is the file's information")
    fileName = fileData["Name"]
    fileHash = fileData["Hash"]
    fileSize = fileData["Size"]
    get(fileHash)

    print("Deploying smart contract...")
    account = getAccount()
    storage = Storage.deploy({"from": account})
    print("Uploading to network...")
    tx = storage.uploadFile(
        fileHash, fileSize, file.name.rsplit(".")[1], fileName, {"from": account}
    )
    tx.wait(1)
    print("Uploaded and deployed!")
    print(storage.address)
    print(
        f"You can view your file at https://ipfs.infura.io:5001/api/v0/cat/{fileHash}"
    )
    return fileHash
    # Now, each transaction is on the blockchain. Each transaction has the id, hash, size, type, name,
    # timestamp, and owner information. I want to access all of these transactions when my application
    # is functional and display them all on a table showing all the information + a link to the file


def deploy():
    print("Deploying smart contract...")
    account = getAccount()
    storage = Storage.deploy({"from": account})
    return storage


def main():
    deploy()
