/*
    Copyright (C) 2022 Coinpilot Tech. All rights reserved.
    This file is part of daix-server.
    daix-server is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
    daix-server is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License along with daix-server. If not, see <https://www.gnu.org/licenses/>.
*/
// deps
const config = require("./config.json");
const hedera = require("@hashgraph/sdk");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { info, error, misc } = require("./logger");
const { rateLimit } = require("express-rate-limit");

// controllers
const createAccount = require("./controllers/hederaCreate");

// main function
async function main() {
    // connect to mongodb
    await mongoose.connect(config.mongoUrl);
    info("Connected to MongoDB.");
    // init the express app
    const app = express();
    app.use(bodyParser.json());
    // create client
    const client = hedera.Client.forName(config.network).setOperator(
        hedera.AccountId.fromString(config.accountId),
        hedera.PrivateKey.fromString(config.privateKey)
    );
    info("Initialized Hedera client.");
    // routes
    // considering each hedera account costs 5 cents to make, we put a ratelimit to ensure people don't send a massive amount of creations
    const hederaRateLimit = rateLimit({
        windowMs: 24 * 60 * 60 * 1000,
        max: 1,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.post("/hederaCreate", hederaRateLimit, (req, res) => createAccount(req, res, client));
    // listen on app
    app.listen(config.port, () => {
        info(`Listening on port ${config.port}.`);
    });
}

// call main function
main();