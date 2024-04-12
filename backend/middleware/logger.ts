import { Request, Response, NextFunction } from "express"

export const logger = (req: Request, res: Response, next: NextFunction) => {
	const ipAddress = req.socket.remoteAddress;
	console.log(ipAddress, req.originalUrl)
	next()
}
