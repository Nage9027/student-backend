import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Subject } from '../models/Subject.model';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { firstName, lastName, phone, address, dateOfBirth } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.firstName': firstName,
          'profile.lastName': lastName,
          'profile.phone': phone,
          'profile.address': address,
          'profile.dateOfBirth': new Date(dateOfBirth)
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error });
  }
};

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await Subject.distinct('department');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error });
  }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'profile.avatar': (req as any).file.path },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload avatar', error });
  }
};