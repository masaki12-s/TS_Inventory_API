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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysql = __importStar(require("promise-mysql"));
const index_js_1 = __importDefault(require("./index.js"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.listen(index_js_1.default.port, () => {
    console.log(`Listening on port ${index_js_1.default.port}`);
});
const connection = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield mysql.createConnection(index_js_1.default.db);
});
app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    {
        console.log("test");
    }
}));
// 在庫の更新, 作成
/**
 * POST /v1/stock
 * http resuest body
 * {
 * "name": "string" (required),
 * "amount": 0 (optional),
 * }
 *
 * http response header
 * Location: /v1/stock/:name
 *
 * http response body
 * same as request body
**/
app.post('/v1/stock', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stock = req.body;
    const conn = yield connection();
    const result = yield conn.query('INSERT INTO stock SET ?', stock);
    res.setHeader('Location', `/v1/stock/${stock.name}`);
    res.status(201).json(stock);
}));
