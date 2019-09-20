import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';
//import { Request } from 'aws-sdk';

const router: Router = Router();

// Get all feed items
// the "/" does not indicate our server root, instead this will be the root of where this router in entering from. In this case, this will be api v0 feed route.
//get('/') --> this is saying within this endpoint,  '/' is the end/ the bare endpoint nothing comes after it, but since we're using app.use, then routes.use this will be the final route of that sequence.
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});/* we're using our interface from sequelize to find and count and ordering by id */ 
    items.rows.map((item) => { //we'll be mapping and manipulating our URL 
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);/*once we get a set of items from our database,
                 we are mapping our item with AWS  getSignedURL
                 for the URL that we have stored in the database 
                 this taking our key from our database and trying to get a signed url from S3
                 so we can access that resource directly from our client*/
            }
    });
    res.send(items);// then we send these items back to our client.
});





// Get a specific resource
router.get('/:id', 
    async (req: Request, res: Response) => {
    let { id } = req.params;
    const item = await FeedItem.findByPk(id);
    res.send(item);
});

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        //@TODO try it yourself
        res.send(500).send("not implemented")
});


// Get a signed url to put a new item in the bucket
/*Here we are requesting a specific SignedURL that would only work with the file we are attempting to upload */ 
router.get('/signed-url/:fileName', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', 
    requireAuth, //it means that this enpoint requires auth. not anyone can post info.
    async (req: Request, res: Response) => {
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
    const item = await new FeedItem({
            caption: caption,
            url: fileName
    });

    const saved_item = await item.save(); //Then we're using our Sequelize interface to save that item

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;