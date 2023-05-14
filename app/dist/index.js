"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log(process.env.PORT);
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USERNAME);
const env_port = process.env.PORT || '5000';
const env_db_port = process.env.DB_PORT || '3306';
exports.default = {
    port: parseInt(env_port, 10),
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(env_db_port, 10),
        username: process.env.DB_USERNAME || 'mysql',
        password: process.env.DB_PASSWORD || 'mysql',
        database: process.env.DB_NAME || 'task',
        multipleStatements: true,
    }
};
// export default {
//     port : parseInt(process.env.PORT, 10) || 3000,
//     db : {
//         host : process.env.DB_HOST || 'localhost',
//         port : parseInt(process.env.DB_PORT, 10) || 5432,
//         username : process.env.DB_USERNAME || 'mysql',
//         password : process.env.DB_PASSWORD || 'mysql',
//         database : process.env.DB_NAME || 'task',
//         multipleStatements : true,
//     }
// }
