import {NextFunction, Request, Response} from 'express'
import session from 'express-session'
import { getUserData, getUsers } from '../database';
const bcrypt = require("bcrypt");

declare module 'express-session' {
	interface SessionData {
		user?: { sessionID:string, username:string,
		}
	}
}

const sessionData = session({
	secret: process.env.SECRET_KEY_BINGO || 'your-secret-key',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 1 * 10 * 60 * 1000,
	},
})


const authenticate = async (username: string, password: string): Promise<boolean> => {
	try {
	  const dbUser = await getUserData(username);
	  return await bcrypt.compare(password, dbUser.password);
	} catch (err) {
	  console.error(err);
	  return false;
	}
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	if (req.session.user) {
        next();
    } else {
        res.render('login',{errorMessage: 'Please log in to access the page!', session: req.session});
    }
}

const requiredLoginAllSites = (req: Request, res: Response, next: NextFunction) => {
	!['/login', '/register', '/' ].includes(req.path) ? isAuthenticated(req, res, next) : next();
}

const loginRequest = async (req: Request, res: Response) => {
	const sessionID = req.session.id;

    const {username, password} = req.body
	if (!username) {
		return res.render('login', {errorMessage: 'Please enter your username', session: req.session})
	}else if(!password){
		return res.render('login', {errorMessage: 'Please enter your password!', session: req.session})
	}
	
	if (await authenticate(username, password)) {
		req.session.user = { sessionID , username }
		return res.redirect('/')
	} else {
		return res.render('login', {errorMessage: 'Invalid username or password', session: req.session})
	}
}


export { sessionData, requiredLoginAllSites, loginRequest }
