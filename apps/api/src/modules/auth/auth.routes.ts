//URL paths

import {Router, Request, Response} from 'express'

//initialize the router 
const authRouter: Router = Router();

//GET route that fetch ALL users may be needed later on
authRouter.get('/', (req: Request, res: Response) => {
        res.json({message: 'Fetching all users'})
});

//POST route for registering

interface RegisterBody {
        name: string;
        email: string;
        password: string;
}

//request route

authRouter.post('/register', (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { name, email, password } = req.body;
  res.status(201).json({
        message: `User ${name} created successfully`
  });
})



//POST route for logging in
interface LoginBody {
        email: string;
        password: string;
}

//request route

authRouter.post('/login', (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;
  res.status(201).json({
        message: `User ${email} logged in successfully`
  });
})



export default authRouter;

//EXAMPLE OF STRUCTURE

// // POST Route: Create a user with a typed Request Body
// interface CreateUserBody {
//   username: string;
//   email: string;
// }

// authRouter.post('/', (req: Request<{}, {}, CreateUserBody>, res: Response) => {
//   const { username, email } = req.body; // Fully type-safe
//   res.status(201).json({ 
//     message: `User ${username} created successfully.` 
//   });
// });