import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export const TABLE = [
    {
        Header: "Id",
        accessor: "id"
    },
    {
        Header: "Name",
        accessor: "name"
    },
    {
        Header: "Type",
        accessor: "type"
    },
    {
        Header: "Size",
        accessor: "size"
    },
    {
        Header: "Uploader",
        accessor: "owner"
    },
    {
        Header: "Time Stamp",
        accessor: "timestamp",
        Cell: ({ value }) => {
            var date = new Date(value * 1000);
            return "" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
        }
    },
    {
        Header: "Link",
        accessor: "hash",
        Cell: ({ value }) => {
            return `https://ipfs.infura.io:5001/api/v0/cat/${value}`
        },
        render: ({ row }) => (<Link to={{ pathname: row.Cell.value }}>{row.Cell.value}</Link>)
    }
]