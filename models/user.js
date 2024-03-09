import mongoose from "mongoose";
const { Schema } = mongoose;

import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 2,
    maxlength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email!'
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 3,
    select: false,
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 20,
    default:'lastName',
  },
  location: {
    type: String,
    trim: true,
    maxlength: 30,
    default:'my location',
  },
  resetPasswordToken: String, 
  resetPasswordExpires: Date,
  skills: [{ type: String }],
});

UserSchema.pre('save', async function(){
  console.log(this.modifiedPaths());

  if(!this.isModified('password')) {
    return;
  }
  
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

UserSchema.methods.createToken = function () {
  return jwt.sign(
    { userId: this._id },
    process.env.SECRET_KEY,
    { expiresIn: process.env.LIFETIME }
  );
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcryptjs.compare(candidatePassword, this.password);
  return isMatch;
}

// Method to generate reset password OTP and store it in the user document
UserSchema.methods.generateResetPasswordOTP = function () {
  const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
  this.resetPasswordToken = otp;
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10); // Adding 10 minutes
  
  this.resetPasswordExpires = expirationTime;
}

// Method to send reset password OTP to user's email
UserSchema.methods.sendResetPasswordOTPEmail = async function () {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: this.email,
    subject: 'Reset Password OTP',
    text: `Your OTP for resetting password is: ${this.resetPasswordToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reset password OTP email sent successfully');
  } catch (error) {
    console.error('Error sending reset password OTP email:', error);
    throw new Error('Error sending reset password OTP email');
  }
}

export default mongoose.model('User', UserSchema);
