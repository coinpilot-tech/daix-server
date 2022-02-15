/*
    Copyright (C) 2022 Coinpilot Tech. All rights reserved.
    This file is part of daix-server.
    daix-server is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    daix-server is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License along with daix-server. If not, see <https://www.gnu.org/licenses/>.
*/

const User = require("../models/user");

const findUser = async (req, res) => {
    try {
        // fetch user based on the account ID
        let user = await User.findOne({accountId: req.body.accountId}).exec();
        // if we don't find a user, error
        if (user === null) {
            res.status(500).json({
                status: "error",
                message: "User not found.",
                tip: "Are you sure you have the right account ID?"
            });
            return;
        }
        // return the username otherwise
        res.status(200).json({
            status: "success",
            message: user.username
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

module.exports = findUser;