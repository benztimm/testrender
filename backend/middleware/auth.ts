import {NextFunction, Request, Response} from 'express'
import session from 'express-session'
import { getUserData, getUsers,getUserIdByUsername, getPlayerInRoom,getRoomDetail } from '../database';
import bcrypt from "bcrypt";

declare module 'express-session' {
	interface SessionData {
		user?: { sessionID:string, username:string, userId:number
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
		maxAge: 1 * 60 * 60 * 1000,
	},
})


const authenticate = async (username: string, password: string): Promise<boolean> => {
	try {
	  const dbUser = await getUserData(username);
	  if (dbUser) return await bcrypt.compare(password, dbUser.password);
	  return false;
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
	!['/login', '/register', '/'].includes(req.path) ? isAuthenticated(req, res, next) : next();
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
		const userId = parseInt(await getUserIdByUsername(username))
		req.session.user = { sessionID , username, userId }
		return res.redirect('/')
	} else {
		return res.render('login', {errorMessage: 'Invalid username or password', session: req.session})
	}
}



const isUserExist = async (req: Request, res: Response, next: NextFunction) => {
	const roomId = req.params.roomId
	const player = await getPlayerInRoom(parseInt(roomId))
	const found = player.find((player) => player.user_id == req.session.user?.userId)
	if(!found) {
		res.status(403).render('status403')
		return
	}
	next();
}

const isUserExistAndGameStarted = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roomId = parseInt(req.params.roomId);
        const userId = req.session.user?.userId;

        if (!userId) {
            return res.status(403).render('status403');
        }

        const [players, roomDetail] = await Promise.all([
            getPlayerInRoom(roomId),
            getRoomDetail(roomId),
        ]);

        const playerExists = players.some((player) => player.user_id === userId);
        const gameStarted = roomDetail?.status;

        if (!playerExists || !gameStarted) {
            return res.status(403).render('status403');
        }

        next();
    } catch (error) {
        console.error('Error in isUserExistAndGameStarted middleware:', error);
        res.status(500).send('Internal Server Error');
    }
};


export { sessionData, requiredLoginAllSites, loginRequest ,isUserExist,isUserExistAndGameStarted}
