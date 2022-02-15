/*
    Copyright (C) 2022 Coinpilot Tech. All rights reserved.
    This file is part of daix-server.
    daix-server is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    daix-server is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License along with daix-server. If not, see <https://www.gnu.org/licenses/>.
*/

// deps
const mongoose = require("mongoose");

// schema
const schema = new mongoose.Schema({
    username: String,
    secondaryScrypt: String,
    publicKey: String,
    privateKey: String,
    primaryScryptSalt: String,
    secondaryScryptSalt: String,
    accountId: String
});

const User = mongoose.model("User", schema);
module.exports = User;