// import type { Request, Response } from 'express';
// import RobotSchema from '../models/Bot.schema';
// import { Err, Logger, Success } from '../utils';
// import { AsyncHandler } from '../handlers';

// exports.createRobot = AsyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { name, preprompt, avatar, gender, botType } = req.body;

//   if (!name && !preprompt && !avatar && !gender) {
//     return Err.send(res, 400, 'All fields are mendatory!');
//   }
//   let newBot = RobotSchema.create({
//     name,
//     preprompt,
//     avatar,
//     gender,
//     botType,
//     user: id,
//   });

//   if (newBot) {
//     return Success.send(res, 201, 'Created!');
//   }
//   return Err.send(res, 401, 'Failed to create a bot for you!');
// });
