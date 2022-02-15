/*
    Copyright (C) 2022 Coinpilot Tech. All rights reserved.
    This file is part of daix-server.
    daix-server is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    daix-server is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License along with daix-server. If not, see <https://www.gnu.org/licenses/>.
*/

const User = require("../models/user");
const hedera = require("@hashgraph/sdk");
const hexRegex = /^[a-f0-9]+$/;

const createUser = async (req, res, client) => {
    try {
        // make sure the parameters are set up correctly
        const required = ["username", "secondaryScrypt", "publicKey", "privateKey", "primaryScryptSalt", "secondaryScryptSalt", "accountId"];
        const hexParams = ["secondaryScrypt", "publicKey", "privateKey", "primaryScryptSalt", "secondaryScryptSalt"];
        const scryptParams = ["secondaryScrypt", "primaryScryptSalt", "secondaryScryptSalt"];
        for (parameter of required) {
            if (req.body[parameter] === undefined) {
                res.status(500).json({
                    status: "error",
                    message: `Request is missing ${parameter}.`,
                    tip: "Check to make sure you have the correct parameters."
                });
                return;
            }
            else if (typeof req.body[parameter] !== "string") {
                res.status(500).json({
                    status: "error",
                    message: `${parameter} should be a string.`,
                    tip: "Check to make sure your parameters are correct."
                });
                return;
            }
            else if (typeof req.body[parameter].length > 1024) {
                res.status(500).json({
                    status: "error",
                    message: "Parameters should not be more than 1024 characters in length.",
                    tip: "Check to make sure your parameters are correct."
                });
                return;
            }
        }
        for (parameter of hexParams) {
            if (!hexRegex.test(req.body[parameter])) {
                res.status(500).json({
                    status: "error",
                    message: `${parameter} should be hexadecimal.`,
                    tip: "You can't use any other encoding."
                });
                return;
            }
        }
        for (parameter of scryptParams) {
            if (req.body[parameter].length !== 64) {
                res.status(500).json({
                    status: "error",
                    message: `${parameter} has improper length (should be 32 bytes, or 64 characters)`,
                    tip: "The scrypt salts should both be 32 bytes, and the scrypt output should be 32 bytes."
                });
                return;
            }
        }
        // make sure the username isn't taken
        if (await User.findOne({ username: req.body.username }).exec() !== null) {
            res.status(500).json({
                status: "error",
                message: "Username taken.",
                tip: "The username is taken. Pick another one."
            });
            return;
        }
        // prevent the user from creating two accounts with the same key
        else if (await User.findOne({ publicKey: req.body.publicKey }).exec() !== null) {
            res.status(500).json({
                status: "error",
                message: "You cannot create two accounts with the same key.",
                tip: "Generate another key. If it is essential, use the findUser API."
            });
            return;
        }
        // ensure the salts are different
        if (req.body.primaryScryptSalt === req.body.secondaryScryptSalt) {
            res.status(500).json({
                status: "error",
                message: "Primary scrypt salt and secondary scrypt salt must be different.",
                tip: "Please don't try bypassing this. Having the same primary and secondary salt completely breaks the security of the system. Instead, generate a random salt for both and try again."
            });
            return;
        }
        // make sure the account exists and that the public key matches
        const query = new hedera.AccountInfoQuery().setAccountId(req.body.accountId);
        const accountInfo = await query.execute(client);
        if (accountInfo.key.toString() !== req.body.publicKey) {
            res.status(500).json({
                status: "error",
                message: "Account ID and public key do not match.",
                tip: "Make sure the account ID was registered with the public key."
            });
            return;
        }
        const user = new User({
            username: req.body.username,
            secondaryScrypt: req.body.secondaryScrypt,
            publicKey: req.body.publicKey,
            privateKey: req.body.privateKey,
            primaryScryptSalt: req.body.primaryScryptSalt,
            secondaryScryptSalt: req.body.secondaryScryptSalt,
            accountId: req.body.accountId
        });
        await user.save();
        res.status(201).json({
            status: "success"
        });
    }
    catch (e) {
        // return an error if we... error
        res.status(500).json({
            status: "error",
            message: "Unknown error occurred.",
            tip: "You most likely triggered this error through an incorrect account ID. You can use the hederaCreate API to create accounts."
        });
    }
};

module.exports = createUser;