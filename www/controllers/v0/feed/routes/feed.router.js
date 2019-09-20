"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FeedItem_1 = require("../models/FeedItem");
const auth_router_1 = require("../../users/routes/auth.router");
const AWS = __importStar(require("../../../../aws"));
//import { Request } from 'aws-sdk';
const router = express_1.Router();
// Get all feed items
// the "/" does not indicate our server root, instead this will be the root of where this router in entering from. In this case, this will be api v0 feed route.
//get('/') --> this is saying within this endpoint,  '/' is the end/ the bare endpoint nothing comes after it, but since we're using app.use, then routes.use this will be the final route of that sequence.
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield FeedItem_1.FeedItem.findAndCountAll({ order: [['id', 'DESC']] }); /* we're using our interface from sequelize to find and count and ordering by id */
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url); /*once we get a set of items from our database,
             we are mapping our item with AWS  getSignedURL
             for the URL that we have stored in the database
             this taking our key from our database and trying to get a signed url from S3
             so we can access that resource directly from our client*/
        }
    });
    res.send(items); // then we send these items back to our client.
}));
// Get a specific resource
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    const item = yield FeedItem_1.FeedItem.findByPk(id);
    res.send(item);
}));
// update a specific resource
router.patch('/:id', auth_router_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@TODO try it yourself
    res.send(500).send("not implemented");
}));
// Get a signed url to put a new item in the bucket
/*Here we are requesting a specific SignedURL that would only work with the file we are attempting to upload */
router.get('/signed-url/:fileName', auth_router_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({ url: url });
}));
// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', auth_router_1.requireAuth, //it means that this enpoint requires auth. not anyone can post info.
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const caption = req.body.caption;
    const fileName = req.body.url;
    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }
    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }
    // we're instantiating our new FeedItem
    const item = yield new FeedItem_1.FeedItem({
        caption: caption,
        url: fileName
    });
    const saved_item = yield item.save(); //Then we're using our Sequelize interface to save that item
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
}));
exports.FeedRouter = router;
//# sourceMappingURL=feed.router.js.map