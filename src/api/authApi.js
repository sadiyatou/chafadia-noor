import authService from '../services/authService';

/* =========================================================
   REGISTER
========================================================= */

export const register = async userData => {
  try {
    const response =
      await authService.registerUser(userData);

    return {
      success: true,
      data: response,
      message:
        'Account created successfully.',
    };
  } catch (error) {
    console.log(
      'REGISTER API ERROR:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Failed to create account.',
    };
  }
};

/* =========================================================
   LOGIN
========================================================= */

export const login = async ({
  email,
  password,
}) => {
  try {
    const response =
      await authService.loginUser({
        email,
        password,
      });

    return {
      success: true,
      data: response,
      message:
        'Login successful.',
    };
  } catch (error) {
    console.log(
      'LOGIN API ERROR:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Login failed.',
    };
  }
};

/* =========================================================
   LOGOUT
========================================================= */

export const logout = async () => {
  try {
    await authService.logoutUser();

    return {
      success: true,
      message:
        'Logout successful.',
    };
  } catch (error) {
    console.log(
      'LOGOUT API ERROR:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Logout failed.',
    };
  }
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword =
  async email => {
    try {
      await authService.resetUserPassword(
        email
      );

      return {
        success: true,
        message:
          'Password reset email sent successfully.',
      };
    } catch (error) {
      console.log(
        'FORGOT PASSWORD API ERROR:',
        error
      );

      return {
        success: false,
        message:
          error.message ||
          'Failed to send reset email.',
      };
    }
  };

/* =========================================================
   GET PROFILE
========================================================= */

export const getProfile =
  async uid => {
    try {
      const profile =
        await authService.getUserProfile(
          uid
        );

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.log(
        'GET PROFILE API ERROR:',
        error
      );

      return {
        success: false,
        message:
          error.message ||
          'Failed to load profile.',
      };
    }
  };

/* =========================================================
   UPDATE PROFILE
========================================================= */

export const updateProfile =
  async (uid, profileData) => {
    try {
      const profile =
        await authService.updateUserProfile(
          uid,
          profileData
        );

      return {
        success: true,
        data: profile,
        message:
          'Profile updated successfully.',
      };
    } catch (error) {
      console.log(
        'UPDATE PROFILE API ERROR:',
        error
      );

      return {
        success: false,
        message:
          error.message ||
          'Failed to update profile.',
      };
    }
  };

/* =========================================================
   ONLINE STATUS
========================================================= */

export const updateOnlineStatus =
  async (uid, isOnline) => {
    try {
      await authService.setUserOnlineStatus(
        uid,
        isOnline
      );

      return {
        success: true,
      };
    } catch (error) {
      console.log(
        'ONLINE STATUS API ERROR:',
        error
      );

      return {
        success: false,
        message:
          error.message ||
          'Failed to update status.',
      };
    }
  };

/* =========================================================
   AUTH LISTENER
========================================================= */

export const authListener =
  callback => {
    return authService.listenToAuthChanges(
      callback
    );
  };

/* =========================================================
   CREATE PROFILE IF MISSING
========================================================= */

export const createProfileIfMissing =
  async user => {
    try {
      const profile =
        await authService.createUserProfileIfMissing(
          user
        );

      return {
        success: true,
        data: profile,
      };
    } catch (error) {
      console.log(
        'CREATE PROFILE API ERROR:',
        error
      );

      return {
        success: false,
        message:
          error.message ||
          'Failed to create profile.',
      };
    }
  };

/* =========================================================
   EXPORT DEFAULT
========================================================= */

export default {
  register,
  login,
  logout,

  forgotPassword,

  getProfile,
  updateProfile,

  updateOnlineStatus,

  authListener,

  createProfileIfMissing,
};