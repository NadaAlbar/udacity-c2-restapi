import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config';


const router: Router = Router();

async function generatePassword(plainTextPassword: string): Promise<string> {
    const saltRounds = 10;
    let salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
    return jwt.sign(user.short(), config.jwt.secret)  ///{jwt.sign} takes the username and secret key, we pass the secret key from config file.
}

//
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    //return next();// this allows us to bypass this method for now and continue with the next method, the NextFunction is the Next Function in line that'll be processing in the body and performing the requests to save more info.
     if (!req.headers || !req.headers.authorization){ //we're checking if there is a request header and if it includes an auth header
         return res.status(401).send({ message: 'No authorization headers.' }); // so the entire flow is terminated bc no auth.
     }
    
// since the Token is in the format "Bearer jgjkrehlktjerhtjk"--> with the space, so we need .split(' '); bc we want the second part.
     const token_bearer = req.headers.authorization.split(' ');
     if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
     }
    
     const token = token_bearer[1];

     return jwt.verify(token, config.jwt.secret, (err, decoded) => { //our server can verify that is a valid token
      if (err) {// if not valid token. we'll retreive an error, if it is, we'll retrive the payload of that Token within the decoded parameter of that returned value. 
      // we can pass the decoded info back to our calling method 
      return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });// we can pass that further down the chain (using next())
      }
      return next(); //
    });
}

router.get('/verification', 
    requireAuth, 
    async (req: Request, res: Response) => {
        return res.status(200).send({ auth: true, message: 'Authenticated.' });
});

router.post('/login', async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);
    // check that user exists
    if(!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // check that the password matches
    const authValid = await comparePasswords(password, user.password_hash)

    if(!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    // Generate JWT
    const jwt = generateJWT(user);

    res.status(200).send({ auth: true, token: jwt, user: user.short()});
});

//register a new user. It will be posted to --> /api/v0/users/auth/
router.post('/', async (req: Request, res: Response) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    // find the user
    const user = await User.findByPk(email);
    // check that user doesnt exists
    if(user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }

    const password_hash = await generatePassword(plainTextPassword);

    const newUser = await new User({
        email: email,
        password_hash: password_hash
    });

    let savedUser;
    try {
        savedUser = await newUser.save();
    } catch (e) {
        throw e;
    }

    // Generate JWT
    const jwt = generateJWT(savedUser);

    res.status(201).send({token: jwt, user: savedUser.short()});
});

router.get('/', async (req: Request, res: Response) => {
    res.send('auth')
});

export const AuthRouter: Router = router;


