/*DTO*/
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from'./dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/*Entities*/
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh_token.entity'
import { ResetToken } from './entities/reset_token.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { Role } from 'src/roles/entities/role.entity';

/*Nestjs Hyper Class*/
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus , NotFoundException, Injectable, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '..//services/mail.service';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(RefreshToken) private RefreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(ResetToken) private ResetTokenRepository: Repository<ResetToken>,
    @InjectRepository(Permission) private PermissionRepository: Repository<Permission>,
    @InjectRepository(Role) private RoleRepository: Repository<Role>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}



/*------------ Create a Signup or Create User ------------*/
async signup(signupDto: SignupDto) {
  // 1. Check if email is already taken
  const existingUser = await this.UserRepository.findOne({ where: { email: signupDto.email } });
  if (existingUser) {
    throw new HttpException('This email address is already registered.', HttpStatus.BAD_REQUEST);
  }

  // 2. Hash the password securely
  const hashedPassword = await bcrypt.hash(signupDto.password, 10);

  // 3. Create new user with status and default role_id
  const newUser = this.UserRepository.create({
    ...signupDto,
    password: hashedPassword,
    status: 'not_verified',
    role: { id: 'beb42f3a-1871-484e-85da-dc51a159ce9f' }, // 👈 Auto assign role_id
  });

  // 4. Save the user
  await this.UserRepository.save(newUser);

  // 5. Generate 6-digit OTP and set expiry (5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  newUser.otp = otp;
  newUser.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);

  // 6. Save OTP info
  await this.UserRepository.save(newUser);

  // 7. Send OTP email
  await this.mailService.sendOtpEmail(newUser.email, otp);

  // 8. Return success message
  return {
    message: 'User registered successfully. Please verify your email using the code sent to you.',
  };
}


/*------------ resendVerifyOtp with email ------------*/
async resendVerifyOtp(email: string) {
  const user = await this.UserRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User account not found.');
  }
  // Generate new OTP and expiry (5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000);
  await this.UserRepository.save(user);
  // Send OTP email using existing mail method
  await this.mailService.sendOtpEmail(user.email, otp);
  return { message: 'The verification code has been resent to your email.' };
}

/*------------ Create a Signup or Create User ------------*/
async verifySignupLoginOtp(email: string, otp: string) {
  const user = await this.UserRepository.findOne({ where: { email } });
  if (!user) {
    throw new HttpException('User account not found.', HttpStatus.BAD_REQUEST);
  }

  // Check if suspended
  if (user.status === 'suspended') {
    throw new HttpException('Your account has been suspended. Please contact support.', HttpStatus.FORBIDDEN);
  }

  if (!user.otp || !user.otp_expires_at || user.otp_expires_at < new Date()) {
    throw new HttpException('The verification code has expired or is invalid.', HttpStatus.BAD_REQUEST);
  }

  if (user.otp !== otp) {
    throw new HttpException('Incorrect verification code.', HttpStatus.BAD_REQUEST);
  }

  // If user is not verified (sign-up flow), mark verified by updating status
  if (user.status === 'not_verified') {
    user.status = 'active';
  }

  // Clear OTP fields after successful verification
  user.otp = null;
  user.otp_expires_at = null;
  await this.UserRepository.save(user);

  // Delete existing refresh tokens for this user
  await this.RefreshTokenRepository.delete({ user: { id: user.id } });

  // Generate JWT tokens
  const payload = { email: user.email, sub: user.id, role: user.role.name };
  const accessToken = this.jwtService.sign(payload);
  const refreshToken = uuidv4();

  // Save refresh token entity
  const refreshTokenEntity = this.RefreshTokenRepository.create({
    refresh_token: refreshToken,
    user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
  });
  await this.RefreshTokenRepository.save(refreshTokenEntity);

  return {
    message: 'Verification code confirmed successfully.',
    accessToken,
    refreshToken,
  };
}


/*------------ Login and Generate JWT Token ------------*/
async login(createLoginDto: LoginDto) {
  const user = await this.UserRepository.findOne({ where: { email: createLoginDto.email } });
  if (!user) {
    throw new HttpException('The provided credentials are incorrect.', HttpStatus.BAD_REQUEST);
  }

  const passwordMatch = await bcrypt.compare(createLoginDto.password, user.password);
  if (!passwordMatch) {
    throw new HttpException('Invalid password. Please try again.', HttpStatus.BAD_REQUEST);
  }

  if (user.status === 'suspended') {
    throw new HttpException('Your account has been suspended. Please contact support.', HttpStatus.FORBIDDEN);
  }

  // Generate OTP and save
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes
  await this.UserRepository.save(user);

  // Send OTP email
  await this.mailService.sendOtpEmail(user.email, otp);

  return {
    message: 'OTP sent to your email. Please verify to complete login.',
  };
}

/*------------ refreshTokens and Generate refresh new access Token and refresh token ------------*/
async refreshTokens(createRefreshTokenDto: RefreshTokenDto) {
  // 1. Find the old token with user relation
  const storedToken = await this.RefreshTokenRepository.findOne({
    where: { refresh_token: createRefreshTokenDto.refreshtoken },
    relations: ['user'],
  });
  if (!storedToken) {
    throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
  }
  // 2. Check if expired
  if (storedToken.expires_at < new Date()) {
    await this.RefreshTokenRepository.remove(storedToken);
    throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
  }
  const user = storedToken.user;
  // 3. Delete old token from database
  await this.RefreshTokenRepository.remove(storedToken);
  // 4. Generate new tokens
  const payload = { email: user.email, sub: user.id , role: user.role.name };
  const newAccessToken = this.jwtService.sign(payload);
  const newRefreshToken = uuidv4();
  // 5. Save new refresh token
  const newTokenEntity = this.RefreshTokenRepository.create({
    refresh_token: newRefreshToken,
    user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await this.RefreshTokenRepository.save(newTokenEntity);
  // 6. Return new tokens
  return {
    message: 'Token refreshed successfully',
    AccessToken: newAccessToken,
    RefreshToken: newRefreshToken,
    userid: user.id,
  };
}

/*------------ Change Password with Old Password and New Password ------------*/
async changePassword(userId: string, oldPassword: string, newPassword: string) {
  // 1️⃣ Find the user
  const user = await this.UserRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  // 2️⃣ Prevent using the same password
  if (oldPassword === newPassword) {
    throw new UnauthorizedException('New password must be different from the old password.');
  }

  // 3️⃣ Check if old password is correct
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedException('Invalid password. Please try again. old password is correct');
  }

  // 4️⃣ Hash and save new password
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = newHashedPassword;
  await this.UserRepository.save(user);

  // ✅ Success response
  return { message: 'Password changed successfully' };
}

/*------------ Forget Password with Sent Email ------------*/
async forgetPassword(email: string) {
  // 1. Find user by email
  const user = await this.UserRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  // 2. Delete all expired reset tokens for this user (expired before now)
  await this.ResetTokenRepository.delete({
    user: { id: user.id },
    expires_at: LessThan(new Date()),
  });
  // 3. Generate reset token
  const resetToken = uuidv4();
  const resetTokenEntity = this.ResetTokenRepository.create({
    reset_token: resetToken,
    user,
    expires_at: new Date(Date.now() + 15 * 60 * 1000), // expires in 15 minutes
  });
  await this.ResetTokenRepository.save(resetTokenEntity);
  // 4. Send email using MailService (passing token only)
  await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  return { message: 'Reset password link sent to your email' };
}

/*------------ Reset Password with Token  ------------*/
async resetPassword(token: string, newPassword: string) {
  // 1. Find reset token
  const resetToken = await this.ResetTokenRepository.findOne({
    where: { reset_token: token },
    relations: ['user'],
  });

  if (!resetToken || resetToken.expires_at < new Date()) {
    throw new BadRequestException('Invalid or expired token');
  }

  // 2. Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. Update user password
  resetToken.user.password = hashedPassword;
  await this.UserRepository.save(resetToken.user);

  // 4. Delete the reset token
  await this.ResetTokenRepository.delete({ id: resetToken.id });

  return { message: 'Password has been reset successfully' };
}

/*------------ Get Profile or View a profile by user------------*/
async getProfile(userId: string) {
  const user = await this.UserRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException('User not found.');
  }

  // Return a safe subset of user data (no cart info)
  return {
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    image: user.image,
    gender: user.gender,
    phone_number: user.phone_number,
    date_of_birth: user.date_of_birth,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role_id: user.role,
  };
}

/*------------ Update Profile by user ------------*/
async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
  // 1. Find user
  const user = await this.UserRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('User not found.');
  }

  // 2. Merge only provided fields
  Object.assign(user, updateProfileDto);

  // 3. Save updated user
  await this.UserRepository.save(user);

  // 4. Return filtered profile
  const filteredProfile = Object.fromEntries(
    Object.entries({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      gender: user.gender,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth,
      image: user.image,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }).filter(([_, value]) => value !== null && value !== undefined)
  );

  return {
    message: 'Profile updated successfully.',
    profile: filteredProfile,
  };
}


/*------------ Get All Users ------------*/
async getAllUsers(): Promise<User[]> {
  return this.UserRepository.find();
}


/*------------ Toggle User Suspension or Activation ------------*/
async toggleUserSuspension(userId: string) {
  const user = await this.UserRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Toggle logic
  if (user.status === 'active' || user.status === 'not_verified') {
    user.status = 'suspended';
  } else if (user.status === 'suspended') {
    user.status = 'active';
  } else {
    throw new BadRequestException('User must be verified before suspending or reactivating');
  }

  await this.UserRepository.save(user);

  return {
    message:
      user.status === 'suspended'
        ? 'User suspended successfully.'
        : 'User reactivated successfully.',
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      updated_at: user.updated_at,
    },
  };
}

/*------------ Delete User and Associated Tokens ------------*/
async deleteUser(userId: string) {
  // 1. Find the user
  const user = await this.UserRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // 2. Delete associated refresh tokens
  await this.RefreshTokenRepository.delete({ user: { id: userId } });

  // 3. Delete associated reset tokens
  await this.ResetTokenRepository.delete({ user: { id: userId } });

  // 4. Delete the user
  await this.UserRepository.remove(user); // or: await this.UserRepository.delete(userId);

  // 5. Return success message
  return {
    message: 'User and all associated tokens deleted successfully.',
    userId: user.id,
    email: user.email,
  };
}

/*------------ Toggle User Role between Default and Admin ------------*/
async toggleUserRole(id: string): Promise<{ message: string; newRoleId: string }> {
  const ROLE_A = 'beb42f3a-1871-484e-85da-dc51a159ce9f'; // customer
  const ROLE_B = 'dfc7b04c-d0d1-412f-bbf8-77074a4fb719'; // admin

  const user = await this.UserRepository.findOne({
    where: { id: id },
    relations: ['role'],
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const currentRoleId = user.role?.id;
  const newRoleId = currentRoleId === ROLE_A ? ROLE_B : ROLE_A;

  user.role = { id: newRoleId } as any;
  await this.UserRepository.save(user);

  return {
    message: 'User role updated successfully',
    newRoleId,
  };
}


/*------------ Get User Permissions by User ID ------------*/
async getUserPermissions(userId: string) {
  const user = await this.UserRepository.findOne({
    where: { id: userId },
    relations: ['role', 'role.permissions'], // Load nested relations
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (!user.role) {
    throw new NotFoundException('User has no assigned role');
  }

  return user.role.permissions;
}

}