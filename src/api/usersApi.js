import authService from '../services/authService';

/* =========================================================
   AUTH
========================================================= */

export const login = async (email, password) => {
  try {
    return await authService.login(email, password);
  } catch (error) {
    console.log('LOGIN API ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const register = async userData => {
  try {
    return await authService.register(userData);
  } catch (error) {
    console.log('REGISTER API ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const logout = async () => {
  try {
    return await authService.logout();
  } catch (error) {
    console.log('LOGOUT API ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const resetPassword = async email => {
  try {
    return await authService.resetPassword(email);
  } catch (error) {
    console.log('RESET PASSWORD API ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   USER PROFILE
========================================================= */

export const getCurrentUser = async () => {
  try {
    return await authService.getCurrentUser();
  } catch (error) {
    console.log('GET CURRENT USER ERROR:', error);

    return {
      success: false,
      user: null,
    };
  }
};

export const getUserById = async userId => {
  try {
    return await authService.getUserById(userId);
  } catch (error) {
    console.log('GET USER ERROR:', error);

    return {
      success: false,
      user: null,
    };
  }
};

export const updateProfile = async ({
  userId,
  updates,
}) => {
  try {
    return await authService.updateProfile({
      userId,
      updates,
    });
  } catch (error) {
    console.log('UPDATE PROFILE ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateProfilePhoto = async ({
  userId,
  photoURL,
}) => {
  try {
    return await authService.updateProfilePhoto({
      userId,
      photoURL,
    });
  } catch (error) {
    console.log('UPDATE PHOTO ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   FOLLOWERS
========================================================= */

export const followUser = async ({
  currentUserId,
  targetUserId,
}) => {
  try {
    return await authService.followUser({
      currentUserId,
      targetUserId,
    });
  } catch (error) {
    console.log('FOLLOW USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const unfollowUser = async ({
  currentUserId,
  targetUserId,
}) => {
  try {
    return await authService.unfollowUser({
      currentUserId,
      targetUserId,
    });
  } catch (error) {
    console.log('UNFOLLOW USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const getFollowers = async userId => {
  try {
    return await authService.getFollowers(userId);
  } catch (error) {
    console.log('GET FOLLOWERS ERROR:', error);

    return {
      success: false,
      followers: [],
    };
  }
};

export const getFollowing = async userId => {
  try {
    return await authService.getFollowing(userId);
  } catch (error) {
    console.log('GET FOLLOWING ERROR:', error);

    return {
      success: false,
      following: [],
    };
  }
};

/* =========================================================
   BLOCK USERS
========================================================= */

export const blockUser = async ({
  currentUserId,
  targetUserId,
}) => {
  try {
    return await authService.blockUser({
      currentUserId,
      targetUserId,
    });
  } catch (error) {
    console.log('BLOCK USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const unblockUser = async ({
  currentUserId,
  targetUserId,
}) => {
  try {
    return await authService.unblockUser({
      currentUserId,
      targetUserId,
    });
  } catch (error) {
    console.log('UNBLOCK USER ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   SEARCH USERS
========================================================= */

export const searchUsers = async query => {
  try {
    return await authService.searchUsers(query);
  } catch (error) {
    console.log('SEARCH USERS ERROR:', error);

    return {
      success: false,
      users: [],
    };
  }
};

/* =========================================================
   ONLINE STATUS
========================================================= */

export const updateOnlineStatus = async ({
  userId,
  online,
}) => {
  try {
    return await authService.updateOnlineStatus({
      userId,
      online,
    });
  } catch (error) {
    console.log('ONLINE STATUS ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateLastSeen = async userId => {
  try {
    return await authService.updateLastSeen(userId);
  } catch (error) {
    console.log('LAST SEEN ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   ACCOUNT
========================================================= */

export const deleteAccount = async userId => {
  try {
    return await authService.deleteAccount(userId);
  } catch (error) {
    console.log('DELETE ACCOUNT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

export const deactivateAccount = async userId => {
  try {
    return await authService.deactivateAccount(userId);
  } catch (error) {
    console.log('DEACTIVATE ACCOUNT ERROR:', error);

    return {
      success: false,
      message: error.message,
    };
  }
};

/* =========================================================
   EXPORT
========================================================= */

export default {
  login,
  register,
  logout,
  resetPassword,

  getCurrentUser,
  getUserById,
  updateProfile,
  updateProfilePhoto,

  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,

  blockUser,
  unblockUser,

  searchUsers,

  updateOnlineStatus,
  updateLastSeen,

  deleteAccount,
  deactivateAccount,
};