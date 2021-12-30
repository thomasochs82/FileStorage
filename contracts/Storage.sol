// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

contract Storage {
    address public admin;
    uint256 fileNumber;
    mapping(uint256 => FileData) fileStorage;
    struct FileData {
        uint256 _id;
        string _hash;
        uint256 _size;
        string _type;
        string _name;
        uint256 _timestamp;
        address payable _owner;
    }

    event Upload(
        uint256 _id,
        string _hash,
        uint256 _size,
        string _type,
        string _name,
        uint256 _timestamp,
        address payable _owner
    );

    // Name
    // Number of Files
    // Mapping fileId=>struct
    // Struct
    // Event
    constructor() public {
        admin = msg.sender;
        fileNumber = 0;
    }

    function get() public pure returns (uint256) {
        return 100;
    }

    function getFileNumber() public view returns (uint256) {
        return fileNumber;
    }

    function getId(uint256 _fileNumber) public view returns (uint256) {
        FileData memory tempData = fileStorage[_fileNumber];
        uint256 _id = tempData._id;
        return _id;
    }

    function getHash(uint256 _fileNumber) public view returns (string memory) {
        FileData memory tempData = fileStorage[_fileNumber];
        string memory _hash = tempData._hash;
        return _hash;
    }

    function getSize(uint256 _fileNumber) public view returns (uint256) {
        FileData memory tempData = fileStorage[_fileNumber];
        uint256 _size = tempData._size;
        return _size;
    }

    function getType(uint256 _fileNumber) public view returns (string memory) {
        FileData memory tempData = fileStorage[_fileNumber];
        string memory _type = tempData._type;
        return _type;
    }

    function getName(uint256 _fileNumber) public view returns (string memory) {
        FileData memory tempData = fileStorage[_fileNumber];
        string memory _name = tempData._name;
        return _name;
    }

    function getTimestamp(uint256 _fileNumber) public view returns (uint256) {
        FileData memory tempData = fileStorage[_fileNumber];
        uint256 _timestamp = tempData._timestamp;
        return _timestamp;
    }

    function getOwner(uint256 _fileNumber) public view returns (address) {
        FileData memory tempData = fileStorage[_fileNumber];
        address _owner = tempData._owner;
        return _owner;
    }

    function getFileData(uint256 _fileNumber)
        public
        view
        returns (
            uint256,
            string memory,
            uint256,
            string memory,
            string memory,
            uint256,
            address
        )
    {
        FileData memory tempData = fileStorage[_fileNumber];
        uint256 _id = tempData._id;
        string memory _hash = tempData._hash;
        uint256 _size = tempData._size;
        string memory _type = tempData._type;
        string memory _name = tempData._name;
        uint256 _timestamp = tempData._timestamp;
        address payable _owner = tempData._owner;
        return (_id, _hash, _size, _type, _name, _timestamp, _owner);
    }

    function uploadFile(
        string memory _hash,
        uint256 _size,
        string memory _type,
        string memory _name
    ) public {
        require(fileNumber >= 0);
        require(bytes(_hash).length > 0);
        require(_size != 0);
        require(bytes(_type).length > 0);
        require(bytes(_name).length > 0);
        fileNumber++;
        fileStorage[fileNumber] = FileData(
            fileNumber,
            _hash,
            _size,
            _type,
            _name,
            now,
            msg.sender
        );
        emit Upload(fileNumber, _hash, _size, _type, _name, now, msg.sender);
    }
}
