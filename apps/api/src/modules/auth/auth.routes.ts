//URL paths

import {Router, Request, Response, NextFunction} from 'express'
import {registerSchema, loginSchema} from './auth.schema';
import {success, ZodObject} from 'zod';
import { loginUser, registerUser } from './auth.service';
import { generateToken } from '../../utils/token';


//initialize the router 
const authRouter: Router = Router();



//build a middleware function to handle errors in the routes


export const validateBody = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Perform data validation
    const result = schema.safeParse(req.body);

    // If validation fails, return a 400 Bad Request error early
    if (!result.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return; 
    }

    // Overwrite req.body with the cleaned, parsed data
    req.body = result.data;
    next();
  };
};


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

authRouter.post('/register',validateBody(registerSchema), async(req: Request<{}, {}, RegisterBody>, res: Response) => {

  try {
  const { name, email, password } = req.body;
  // console.log("REGISTER BODY:", req.body);
  const user = await registerUser(req.body);
  const token = generateToken(user.id);

  res.status(201).json({
        success: true,
        message: `User ${user.name} created successfully`,
        user,
        token,
  });

  } catch (error) {

    if (error instanceof Error && error.message === "User already exists") {
      return res.status(409).json({
        success: false,
        message: "User already exists",

      });
    }

    res.status(500).json({ success: false, message: 'Server Error'});

    // console.log("REGISTER ERROR:", error);
  }
})



//POST route for logging in
interface LoginBody {
        email: string;
        password: string;
}

//request route
authRouter.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email } = req.body;

      const user = await loginUser(req.body);
      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: `User ${email} logged in successfully`,
        user,
        token,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid email or password") {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);


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