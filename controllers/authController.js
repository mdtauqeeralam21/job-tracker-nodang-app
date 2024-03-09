import User from '../models/user.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError,UnAuthenticatedError } from '../errors/index.js';
import xssFilters from 'xss-filters';

const oneDay = 1000 * 60 * 60 * 24;

const register = async (req, res) => {
  const { name, email, password } = req.body;


  if (!name || !email || !password) {
    
    throw new BadRequestError("Please provide all values");
  }


  const userAlreadyExists = await User.findOne({email});

  if(userAlreadyExists){
    throw new BadRequestError(`The email: ${email} is already in use.`);
  }


  const user = await User.create({ name, email, password });

  const token = user.createToken();
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      name: user.name
    }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  
  const user = await User.findOne({ email }).select('+password');

  if(!user) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if(!isPasswordCorrect) {
    throw new UnAuthenticatedError("Invalid Credentials");
  }

  const token = user.createToken();
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });

  user.password = undefined;

  res.status( StatusCodes.OK ).json({ 
    user
  });
};

const updateUser = async (req, res) => {
  const { email, name, lastName, location, skills } = req.body;

  if (!email || !name || !lastName || !location || !skills) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  user.email = xssFilters.inHTMLData(email);
  user.name = xssFilters.inHTMLData(name);
  user.lastName = xssFilters.inHTMLData(lastName);
  user.location = xssFilters.inHTMLData(location);
  user.skills = skills;

  await user.save();

  const token = user.createToken();
  
  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(StatusCodes.OK).json({ 
    user,
    skills
  });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  res.status(StatusCodes.OK).json({ 
    user, 
  });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });

  res.status(StatusCodes.OK).json({
    msg: 'User logged out!'
  });
};

export { register, login, updateUser, getCurrentUser, logout }