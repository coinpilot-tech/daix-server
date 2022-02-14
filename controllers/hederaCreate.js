/*
    Copyright (C) 2022 Coinpilot Tech. All rights reserved.
    This file is part of daix-server.
    daix-server is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    daix-server is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License along with daix-server. If not, see <https://www.gnu.org/licenses/>.
*/

const hedera = require("@hashgraph/sdk");
const hexRegex = /^[a-f0-9]+$/g;

const createAccount = async (req, res, client) => {
    try {
        // our account is either 32 or 44 bytes and one byte is two digits
        if (!([64,88]).includes(req.body.publicKey.length)) {
            res.status(500).json({
                status: "error",
                message: "Invalid public key length.",
                tip: "You sent an invalid public key."
            });
            return;
        }
        // we need valid hex
        else if (!hexRegex.test(req.body.publicKey)) {
            res.status(500).json({
                status: "error",
                message: "Public key is not hex.",
                tip: "You sent an invalid public key."
            });
            return;
        }
        // create a transaction to make the account
        const txn = await new hedera.AccountCreateTransaction()
            .setInitialBalance(0)
            .setKey(hedera.PublicKey.fromString(req.body.publicKey))
            .execute(client);
        const receipt = await txn.getReceipt(client);
        // send them their account id
        res.status(201).json({
            status: "success",
            message: receipt.accountId.toString()
        });
    }
    catch (e) {
        // return an error if we error
        res.status(500).json({
            status: "error",
            message: "Unknown error occurred.",
            tip: "You probably set the body wrong. Are you using JSON for the body?"
        });
        return;
    }
};

module.exports = createAccount;