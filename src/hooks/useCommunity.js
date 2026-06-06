import { useCallback, useEffect, useMemo, useState } from 'react';

import communityApi from '../api/communityApi';

const DEFAULT_PROFILE = {
  id: 'me',
  name: 'Sadiyatou',
  username: '@sadiyatou',
  bio: 'Sharing beneficial reminders and building a beautiful Muslim community.',
  location: 'Cameroon',
  friends: 23,
};

const DEFAULT_SETTINGS = {
  notifyPosts: true,
  notifyMessages: true,
  notifyLives: true,
  privateProfile: false,
  safeMode: true,
  dataSaver: false,
};

export default function useCommunity() {
  const [posts, setPosts] = useState([]);
  const [liked, setLiked] = useState([]);
  const [saved, setSaved] = useState([]);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [blockedFollowers, setBlockedFollowers] = useState([]);

  const [contactInvites, setContactInvites] = useState([]);
  const [jobGroups, setJobGroups] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState([]);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTab, setSelectedTab] = useState('All');
  const [query, setQuery] = useState('');

  const [loading, setLoading] = useState(false);

  const loadCommunityData = useCallback(async () => {
    setLoading(true);

    try {
      const loadedPosts = await communityApi.getPosts();
      const loadedLiked = await communityApi.getLikedPosts();
      const loadedSaved = await communityApi.getSavedPosts();
      const loadedProfile = await communityApi.getProfile(DEFAULT_PROFILE);
      const loadedFollowing = await communityApi.getFollowing();
      const loadedFollowers = await communityApi.getFollowers();
      const loadedBlocked = await communityApi.getBlockedFollowers();
      const loadedContacts = await communityApi.getContactInvites();
      const loadedJobGroups = await communityApi.getJobGroups();
      const loadedApplications = await communityApi.getJobApplications();
      const loadedSearchHistory = await communityApi.getSearchHistory();
      const loadedMessages = await communityApi.getMessages();
      const loadedDrafts = await communityApi.getDrafts();
      const loadedSettings = await communityApi.getSettings(DEFAULT_SETTINGS);

      setPosts(loadedPosts || []);
      setLiked(loadedLiked || []);
      setSaved(loadedSaved || []);
      setProfile(loadedProfile || DEFAULT_PROFILE);
      setFollowing(loadedFollowing || []);
      setFollowers(loadedFollowers || []);
      setBlockedFollowers(loadedBlocked || []);
      setContactInvites(loadedContacts || []);
      setJobGroups(loadedJobGroups || []);
      setJobApplications(loadedApplications || []);
      setSearchHistory(loadedSearchHistory || []);
      setMessages(loadedMessages || []);
      setDrafts(loadedDrafts || []);
      setSettings({
        ...DEFAULT_SETTINGS,
        ...(loadedSettings || {}),
      });
    } catch (error) {
      console.log('LOAD COMMUNITY ERROR:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const normalizeSearchText = value =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9@#]+/g, ' ')
      .trim();

  const filteredPosts = useMemo(() => {
    const words = normalizeSearchText(query)
      .split(' ')
      .filter(Boolean);

    return posts.filter(post => {
      const text = normalizeSearchText(
        [
          post.title,
          post.body,
          post.author,
          post.username,
          post.type,
          post.location,
          post.time,
          ...(post.updates || []),
          ...(post.media || []).map(item => item.name || item.type),
          ...(post.comments || []).map(
            comment => `${comment.author} ${comment.text}`
          ),
        ].join(' ')
      );

      const matchesSearch =
        words.length === 0 || words.every(word => text.includes(word));

      const matchesTab =
        selectedTab === 'All' || post.type === selectedTab;

      return matchesSearch && matchesTab;
    });
  }, [posts, query, selectedTab]);

  const myPosts = useMemo(() => {
    return posts.filter(post => post.authorId === profile.id);
  }, [posts, profile]);

  const savedPosts = useMemo(() => {
    return posts.filter(post => saved.includes(post.id));
  }, [posts, saved]);

  const totalMyLikes = useMemo(() => {
    return myPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
  }, [myPosts]);

  const totalMyViews = useMemo(() => {
    return myPosts.reduce((sum, post) => sum + (post.views || 0), 0);
  }, [myPosts]);

  const totalMyVideos = useMemo(() => {
    return myPosts.reduce(
      (sum, post) =>
        sum +
        (post.media || []).filter(item => item.type === 'video').length,
      0
    );
  }, [myPosts]);

  const createPost = async data => {
    const response = await communityApi.createPost({
      ...data,
      profile,
    });

    if (response.success) {
      setPosts(response.posts);
    }

    return response;
  };

  const updatePost = async (postId, updates) => {
    const response = await communityApi.updatePost({
      postId,
      updates,
    });

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const deletePost = async postId => {
    const response = await communityApi.deletePost(postId);

    if (response.success) {
      setPosts(response.posts);
      setLiked(prev => prev.filter(id => id !== postId));
      setSaved(prev => prev.filter(id => id !== postId));

      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    }

    return response;
  };

  const addPostView = async postId => {
    const response = await communityApi.addPostView(postId);

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const toggleLikePost = async postId => {
    const response = await communityApi.toggleLikePost(postId);

    if (response.success) {
      setPosts(response.posts);
      setLiked(response.liked);
      setSelectedPost(response.post);
    }

    return response;
  };

  const toggleSavePost = async postId => {
    const response = await communityApi.toggleSavePost(postId);

    if (response.success) {
      setSaved(response.saved);
    }

    return response;
  };

  const addReaction = async (postId, reaction) => {
    const response = await communityApi.addReaction({
      postId,
      reaction,
    });

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const addComment = async (postId, text) => {
    const response = await communityApi.addComment({
      postId,
      author: profile.name,
      text,
    });

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const deleteComment = async (postId, commentId) => {
    const response = await communityApi.deleteComment({
      postId,
      commentId,
    });

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const reactToComment = async (postId, commentId, reaction) => {
    const response = await communityApi.reactToComment({
      postId,
      commentId,
      reaction,
    });

    if (response.success) {
      setPosts(response.posts);
      setSelectedPost(response.post);
    }

    return response;
  };

  const repostPost = async post => {
    const response = await communityApi.repostPost({
      post,
      profile,
    });

    if (response.success) {
      setPosts(response.posts);
    }

    return response;
  };

  const reportPost = async postId => {
    return communityApi.reportPost(postId);
  };

  const saveProfile = async updatedProfile => {
    const response = await communityApi.saveProfile(updatedProfile);

    if (response.success) {
      setProfile(response.profile);
      setPosts(response.posts);
    }

    return response;
  };

  const toggleFollowUser = async authorId => {
    if (authorId === profile.id) {
      return {
        success: false,
        message: 'You cannot follow yourself.',
      };
    }

    const response = await communityApi.toggleFollowUser(authorId);

    if (response.success) {
      setFollowing(response.following);
    }

    return response;
  };

  const addFollower = async followerId => {
    const response = await communityApi.addFollower(followerId);

    if (response.success) {
      setFollowers(response.followers);
    }

    return response;
  };

  const toggleBlockFollower = async followerId => {
    const response = await communityApi.toggleBlockFollower(followerId);

    if (response.success) {
      setBlockedFollowers(response.blockedFollowers);
    }

    return response;
  };

  const updateContactInviteStatus = async (contactId, status) => {
    const response = await communityApi.updateContactInviteStatus({
      contactId,
      status,
    });

    if (response.success) {
      setContactInvites(response.contactInvites);
    }

    return response;
  };

  const createJobGroup = async data => {
    const response = await communityApi.createJobGroup({
      ...data,
      mentor: profile.name,
    });

    if (response.success) {
      setJobGroups(response.jobGroups);
    }

    return response;
  };

  const joinJobGroup = async groupId => {
    const response = await communityApi.joinJobGroup(groupId);

    if (response.success) {
      setJobGroups(response.jobGroups);
    }

    return response;
  };

  const deleteJobGroup = async groupId => {
    const response = await communityApi.deleteJobGroup(groupId);

    if (response.success) {
      setJobGroups(response.jobGroups);
    }

    return response;
  };

  const applyForJob = async post => {
    const response = await communityApi.applyForJob({
      post,
      profile,
    });

    if (response.success) {
      setJobApplications(response.jobApplications);
    }

    return response;
  };

  const deleteJobApplication = async applicationId => {
    const response = await communityApi.deleteJobApplication(applicationId);

    if (response.success) {
      setJobApplications(response.jobApplications);
    }

    return response;
  };

  const saveSearchTerm = async term => {
    if (!term?.trim()) return;

    const response = await communityApi.saveSearchTerm(term.trim());

    if (response.success) {
      setSearchHistory(response.searchHistory);
    }

    return response;
  };

  const deleteSearchTerm = async term => {
    const response = await communityApi.deleteSearchTerm(term);

    if (response.success) {
      setSearchHistory(response.searchHistory);
    }

    return response;
  };

  const clearSearchHistory = async () => {
    const response = await communityApi.clearSearchHistory();

    if (response.success) {
      setSearchHistory([]);
    }

    return response;
  };

  const sendCommunityMessage = async ({
    recipient,
    text = '',
    media = [],
  }) => {
    const isFollower = followers.includes(recipient);

    const response = await communityApi.sendCommunityMessage({
      recipient,
      text,
      media,
      isFollower,
    });

    if (response.success) {
      setMessages(response.messages);
    }

    return response;
  };

  const deleteCommunityMessage = async messageId => {
    const response = await communityApi.deleteCommunityMessage(messageId);

    if (response.success) {
      setMessages(response.messages);
    }

    return response;
  };

  const saveDraftPost = async data => {
    const response = await communityApi.saveDraftPost({
      ...data,
      profile,
    });

    if (response.success) {
      setDrafts(response.drafts);
    }

    return response;
  };

  const deleteDraftPost = async draftId => {
    const response = await communityApi.deleteDraftPost(draftId);

    if (response.success) {
      setDrafts(response.drafts);
    }

    return response;
  };

  const updateSettings = async updates => {
    const nextSettings = {
      ...settings,
      ...updates,
    };

    await communityApi.saveSettings(nextSettings);
    setSettings(nextSettings);

    return {
      success: true,
      settings: nextSettings,
    };
  };

  return {
    posts,
    filteredPosts,
    liked,
    saved,
    savedPosts,

    profile,
    following,
    followers,
    blockedFollowers,
    contactInvites,

    jobGroups,
    jobApplications,
    searchHistory,
    messages,
    drafts,
    settings,

    selectedPost,
    selectedTab,
    query,
    loading,

    myPosts,
    totalMyLikes,
    totalMyViews,
    totalMyVideos,

    setPosts,
    setLiked,
    setSaved,
    setProfile,
    setFollowing,
    setFollowers,
    setBlockedFollowers,
    setContactInvites,
    setJobGroups,
    setJobApplications,
    setSearchHistory,
    setMessages,
    setDrafts,
    setSettings,
    setSelectedPost,
    setSelectedTab,
    setQuery,

    loadCommunityData,

    createPost,
    updatePost,
    deletePost,
    addPostView,

    toggleLikePost,
    toggleSavePost,
    addReaction,

    addComment,
    deleteComment,
    reactToComment,

    repostPost,
    reportPost,

    saveProfile,
    toggleFollowUser,
    addFollower,
    toggleBlockFollower,
    updateContactInviteStatus,

    createJobGroup,
    joinJobGroup,
    deleteJobGroup,
    applyForJob,
    deleteJobApplication,

    saveSearchTerm,
    deleteSearchTerm,
    clearSearchHistory,

    sendCommunityMessage,
    deleteCommunityMessage,

    saveDraftPost,
    deleteDraftPost,

    updateSettings,
  };
}