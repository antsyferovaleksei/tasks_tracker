import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../config/supabase';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { createUserSchema, loginSchema } from 'shared/src/validation';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const { email, name, password } = validatedData;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser && !checkError) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user using admin client
    const { data: user, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          name,
          password: hashedPassword,
        }
      ])
      .select('id, email, name, avatar, created_at, updated_at')
      .single();

    if (createError || !user) {
      console.error('Create user error:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
      message: 'User successfully registered',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration error',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Wrong email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Wrong email or password',
      });
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: 'Success login',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login error',
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if user still exists
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar, created_at, updated_at')
      .eq('id', decoded.userId)
      .single();

    if (findError || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      success: true,
      data: {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Wrong refresh token',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Success logout',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout error',
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required',
      });
    }

    // Find user with password
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', userId)
      .select('id, email, name, avatar, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Change password error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Change password error',
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Password successfully changed',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Change password error',
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (findError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting profile',
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar } = req.body;
    const userId = (req as any).user?.userId;

    // Check if email is not taken by another user
    if (email) {
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (existingUser && !checkError) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken',
        });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, name, avatar, created_at, updated_at')
      .single();

    if (updateError) {
      console.error('Update profile error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Update profile error',
      });
    }

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile successfully updated',
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Update profile error',
    });
  }
}; 