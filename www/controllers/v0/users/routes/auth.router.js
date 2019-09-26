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
const User_1 = require("../models/User");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const EmailValidator = __importStar(require("email-validator"));
const config_1 = require("../../../../config/config");
const router = express_1.Router();
function generatePassword(plainTextPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        let salt = yield bcrypt.genSalt(saltRounds);
        return yield bcrypt.hash(plainTextPassword, salt);
    });
}
function comparePasswords(plainTextPassword, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt.compare(plainTextPassword, hash);
    });
}
function generateJWT(user) {
    return jwt.sign(user.short(), config_1.config.jwt.secret); ///{jwt.sign} takes the username and secret key, we pass the secret key from config file.
}
//
function requireAuth(req, res, next) {
    //return next();// this allows us to bypass this method for now and continue with the next method, the NextFunction is the Next Function in line that'll be processing in the body and performing the requests to save more info.
    if (!req.headers || !req.headers.authorization) { //we're checking if there is a request header and if it includes an auth header
        return res.status(401).send({ message: 'No authorization headers.' }); // so the entire flow is terminated bc no auth.
    }
    // since the Token is in the format "Bearer jgjkrehlktjerhtjk"--> with the space, so we need .split(' '); bc we want the second part.
    const token_bearer = req.headers.authorization.split(' ');
    if (token_bearer.length != 2) {
        return res.status(401).send({ message: 'Malformed token.' });
    }
    const token = token_bearer[1];
    return jwt.verify(token, config_1.config.jwt.secret, (err, decoded) => {
        if (err) { // if not valid token. we'll retreive an error, if it is, we'll retrive the payload of that Token within the decoded parameter of that returned value. 
            // we can pass the decoded info back to our calling method 
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' }); // we can pass that further down the chain (using next())
        }
        return next(); //
    });
}
exports.requireAuth = requireAuth;
router.get('/verification', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const user = yield User_1.User.findByPk(email);
    // check that user exists
    if (!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }
    // check that the password matches
    const authValid = yield comparePasswords(password, user.password_hash);
    if (!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }
    // Generate JWT
    const jwt = generateJWT(user);
    res.status(200).send({ auth: true, token: jwt, user: user.short() });
}));
//register a new user. It will be posted to --> /api/v0/users/auth/
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const user = yield User_1.User.findByPk(email);
    // check that user doesnt exists
    if (user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }
    const password_hash = yield generatePassword(plainTextPassword);
    const newUser = yield new User_1.User({
        email: email,
        password_hash: password_hash
    });
    let savedUser;
    try {
        savedUser = yield newUser.save();
    }
    catch (e) {
        throw e;
    }
    // Generate JWT
    const jwt = generateJWT(savedUser);
    res.status(201).send({ token: jwt, user: savedUser.short() });
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('auth');
}));
exports.AuthRouter = router;
//# sourceMappingURL=auth.router.js.map