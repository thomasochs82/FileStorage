import React, { Component, useMemo } from "react"
import './App.css'
import { getWeb3 } from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import { getEthereum } from "./getEthereum"
import { create } from 'ipfs-http-client';
import { useTable } from 'react-table'
import { TABLE } from './fileTable'
import './table.css'

class App extends Component {
    state = {
        web3: null,
        accounts: null,
        chainid: null,
        transactionHash: null,
        fileStorage: null,
        storageInput: 0,
        fileNumber: 0,
        fileSelected: 0,
        hashValue: "nothing yet...",
        fileData: [],
        latestFile: null,
        existingFiles: null,
        message: ""
    }



    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()
        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            // ethereum.enable()
            ethereum.request({ method: 'eth_requestAccounts' });
        } catch (e) {
            console.log(`Could not enable accounts. 
            Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }
        // Use web3 to get the users accounts
        const accounts = await web3.eth.getAccounts()
        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())
        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)
    }
    loadInitialContracts = async () => {
        var _chainID = 0;
        if (this.state.chainid === 3) {
            _chainID = 3;
        }
        if (this.state.chainid === 4) {
            _chainID = 4;
        }
        if (this.state.chainid === 1337) {
            _chainID = "dev"
        }
        const fileStorage = await this.loadContract(_chainID, "Storage")
        if (!fileStorage) {
            return
        }
        const fileNumber = await fileStorage.methods.getFileNumber().call()
        const existingFiles = new Set()
        this.setState({
            fileStorage,
            fileNumber,
            existingFiles
        })

        await this.fillFileData()
        this.setState({
            message: "Please select a file to store to IPFS."
        })
    }
    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const { web3 } = this.state
        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Could not find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }
        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }
        console.log(`Found "${address}" on the chain "${contractArtifact.abi}".`)
        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    fillFileData = async () => {
        this.setState({
            message: "Loading initial contracts..."
        })
        const { fileStorage } = this.state
        // Make sure the file number matches what the Storage contract has
        this.setState({
            fileNumber: await fileStorage.methods.getFileNumber().call()
        })
        const { fileNumber } = this.state
        const fileStorageContract = this.state.fileStorage;
        if (!fileStorageContract) {
            return
        }
        for (let i = 1; i < fileNumber; i++) {
            // Retrieve all componenets needed for the table
            const _id = await fileStorage.methods.getId(i).call()
            const _hash = await fileStorage.methods.getHash(i).call()
            const _size = await fileStorage.methods.getSize(i).call()
            const _type = await fileStorage.methods.getType(i).call()
            const _name = await fileStorage.methods.getName(i).call()
            const _timestamp = await fileStorage.methods.getTimestamp(i).call()
            const _owner = await fileStorage.methods.getOwner(i).call()

            // Store the file that has been uploaded to ipfs as a json object and add it to the fileData array of json objects
            const storeFileAsJson = { "id": _id, "hash": _hash, "size": _size, "type": _type, "name": _name, "timestamp": _timestamp, "owner": _owner }
            // Only add the file to the table if it is not already present
            this.state.fileData.push(storeFileAsJson)
            this.state.existingFiles.add(_name)
        }
        this.setState({
            fileData: this.state.fileData
        })
        return
    }

    onChange = async (e) => {
        this.setState({
            message: ""
        })
        let files = e.target.files;

        let reader = new FileReader();

        try {
            reader.readAsDataURL(files[0]);
            reader.onload = async (e) => {
                this.setState({ latestFile: e.target.result });
            }
        } catch (error) {
            this.setState({
                message: "No file selected. Please select a file to be stored.",
                latestFile: null
            })
            return;
        }


    }
    getFileInfo = async (e) => {
        e.preventDefault();
        const { fileStorage, fileNumber } = this.state
        console.warn("got here");
        const fileStorageContract = this.state.fileStorage;
        if (!fileStorageContract) {
            return
        }
        this.setState({
            hashValue: await fileStorage.methods.getHash(fileNumber).call()._hash
        })
        console.warn(await fileStorage.methods.getHash(fileNumber).call()._hash)
    }
    refreshTable = async () => {
        const { fileStorage, fileNumber } = this.state
        console.warn("got here");
        const fileStorageContract = this.state.fileStorage;
        if (!fileStorageContract) {
            return
        }
        this.setState({
            hashValue: await fileStorage.methods.getHash(fileNumber).call()._hash
        })
        console.warn(await fileStorage.methods.getHash(fileNumber).call()._hash)
    }
    findFileHash = async (e) => {
        e.preventDefault();

        const { accounts, fileStorage, latestFile, fileData } = this.state






        const client = create('https://ipfs.infura.io:5001/api/v0')
        if (latestFile == null) {
            this.setState({
                message: "No file selected. Please select a file to be stored."
            })
            return
        }
        const addFile = await client.add(latestFile)
        console.warn(addFile)
        const fileHash = addFile.path
        const fileSize = addFile.size
        const inputFile = document.getElementById("inputFile").value;
        const fileName = inputFile.substring(inputFile.lastIndexOf("\\") + 1, inputFile.length)
        const fileType = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)
        console.warn(fileHash + " " + fileSize + " " + fileType + " " + fileName)

        console.warn(this.state.existingFiles)
        const numFilesBefore = this.state.existingFiles.size
        this.state.existingFiles.add(fileName)
        const numFilesAfter = this.state.existingFiles.size
        console.warn(this.state.existingFiles)
        if (numFilesBefore === numFilesAfter) {
            this.setState({
                message: "File already stored! Select a different file to add."
            })
            return
        }

        this.setState({
            message: "Adding file...This will take a few seconds up to a couple minutes...Check your Metamask extension in your browser for more information"
        })
        await fileStorage.methods.uploadFile(fileHash, fileSize, fileType, fileName).send({ from: accounts[0] })
            .on('receipt', async () => {
                // Make sure the file number matches what the Storage contract has
                this.setState({
                    fileNumber: await fileStorage.methods.getFileNumber().call()
                })
                const { fileNumber } = this.state

                // Retrieve all componenets needed for the table
                const _id = await fileStorage.methods.getId(fileNumber).call()
                const _hash = await fileStorage.methods.getHash(fileNumber).call()
                const _size = await fileStorage.methods.getSize(fileNumber).call()
                const _type = await fileStorage.methods.getType(fileNumber).call()
                const _name = await fileStorage.methods.getName(fileNumber).call()
                const _timestamp = await fileStorage.methods.getTimestamp(fileNumber).call()
                const _owner = await fileStorage.methods.getOwner(fileNumber).call()

                // Store the file that has been uploaded to ipfs as a json object and add it to the fileData array of json objects
                const storeFileAsJson = { "id": _id, "hash": _hash, "size": _size, "type": _type, "name": _name, "timestamp": _timestamp, "owner": _owner }
                // Only add the file to the table if it is not already present
                this.state.fileData.push(storeFileAsJson)

                this.setState({
                    hashValue: await fileStorage.methods.getHash(fileNumber).call(),
                    message: "File added! Choose a different file to add."
                })
            })




    }
    findFileNumber = async () => {
        const { accounts, fileStorage } = this.state
        await fileStorage.methods.getFileNumber().send({ from: accounts[0] })
            .on('receipt', async () => {
                this.setState({
                    fileNumber: await fileStorage.methods.getFileNumber().call()
                })
            })
    }

    render() {
        const {
            web3, accounts, fileStorage, storageInput,
            transactionHash, hashValue,
            fileNumber, fileSelected, message,
        } = this.state
        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }
        if (!fileStorage) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }
        const isAccountsUnlocked = accounts ? accounts.length > 0 : false
        const BasicTable = () => {
            // Memoize the columns and data to add to those columns and retrieve the necessary variables
            const columns = useMemo(() => TABLE, [])
            const data = useMemo(() => this.state.fileData, [])
            const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } = useTable({ columns, data })

            return (
                <>
                    <table id="basicTable" {...getTableProps()}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row)
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => {
                                            return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            {footerGroups.map(footerGroup => (
                                <tr {...footerGroup.getFooterGroupProps()}>
                                    {footerGroup.headers.map(column => (
                                        <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                                    ))}
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </>
            )
        }
        return (<div className="App">
            {
                !isAccountsUnlocked ?
                    <p><strong>Connect with Metamask and refresh the page to
                        be able to edit the storage fields.</strong>
                    </p>
                    : null
            }
            <h2>Solidity Storage Contract</h2>
            <form onSubmit={(e) => this.findFileHash(e)}>
                <div>
                    <br />
                    <br />
                    <label>{message}</label>
                    <br />
                    <br />
                    <br />
                    <input type="file" name="inputFile" onChange={(e) => this.onChange(e)} id="inputFile" />
                    <br />
                    <button type="submit" disabled={!isAccountsUnlocked}>Submit</button>

                </div>
            </form>
            <br />
            <br />
            <BasicTable />
        </div>)
    }
}
export default App