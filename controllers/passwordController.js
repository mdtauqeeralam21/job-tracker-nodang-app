import User from '../models/user.js';
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.generateResetPasswordOTP();
    await user.save();

    
    await user.sendResetPasswordOTPEmail();

    return res.status(200).json({ message: 'Reset password OTP sent successfully' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in verifying OTP:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    if (user.resetPasswordToken !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { forgotPassword, verifyOTP, resetPassword };
