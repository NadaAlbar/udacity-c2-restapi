import { Router, Request, Response } from 'express';
import { FeedRouter } from './feed/routes/feed.router';
import { UserRouter } from './users/routes/user.router';

const router: Router = Router();//we are insstantiating a new router object. 


//we can now declare more specific end points using the same router.use
router.use('/feed', FeedRouter);//feed endpoint will be linked to our feed router module. 
router.use('/users', UserRouter);

router.get('/', async (req: Request, res: Response) => {    
    res.send(`V0`);
});

export const IndexRouter: Router = router;