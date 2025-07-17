import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { UserState, UserAction } from '../types'
import { User, UserLevel } from '@/lib/userManagement'

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
}

// Async thunks for user management
export const createAnonUser = createAsyncThunk(
  'user/createAnonUser',
  async (): Promise<User> => {
    const user: User = {
      id: `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: UserLevel.ANON,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        notifications: true,
        autoSave: true,
        defaultView: 'dashboard'
      }
    }
    return user
  }
)

export const upgradeToStandard = createAsyncThunk(
  'user/upgradeToStandard',
  async ({ email, name }: { email: string; name?: string }, { getState }: { getState: () => any }): Promise<User> => {
    const state = getState()
    const currentUser = state.user.currentUser

    if (!currentUser) {
      throw new Error('No user to upgrade')
    }

    if (!email || !email.trim()) {
      throw new Error('Email is required to upgrade to standard')
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    const upgradedUser: User = {
      ...currentUser,
      email: email.trim(),
      name: name?.trim() || undefined,
      level: UserLevel.STANDARD,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    return upgradedUser
  }
)

export const upgradeToPremium = createAsyncThunk(
  'user/upgradeToPremium',
  async (_, { getState }: { getState: () => any }): Promise<User> => {
    const state = getState()
    const currentUser = state.user.currentUser

    if (!currentUser) {
      throw new Error('No user to upgrade')
    }

    // Check if user is already premium or higher
    if (currentUser.level === UserLevel.PREMIUM || currentUser.level === UserLevel.ADMIN) {
      throw new Error('User is already premium or higher')
    }

    // Check if user has an email (required for premium)
    if (!currentUser.email) {
      throw new Error('Email is required to upgrade to premium')
    }

    const upgradedUser: User = {
      ...currentUser,
      level: UserLevel.PREMIUM,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    return upgradedUser
  }
)

export const upgradeToAdmin = createAsyncThunk(
  'user/upgradeToAdmin',
  async (_, { getState }: { getState: () => any }): Promise<User> => {
    const state = getState()
    const currentUser = state.user.currentUser

    if (!currentUser) {
      throw new Error('No user to upgrade')
    }

    const upgradedUser: User = {
      ...currentUser,
      level: UserLevel.ADMIN,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    return upgradedUser
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.error = null
    },
    clearUser: (state) => {
      state.currentUser = null
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // createAnonUser
      .addCase(createAnonUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAnonUser.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(createAnonUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create anonymous user'
      })
      // upgradeToStandard
      .addCase(upgradeToStandard.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(upgradeToStandard.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(upgradeToStandard.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to upgrade to standard'
      })
      // upgradeToPremium
      .addCase(upgradeToPremium.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(upgradeToPremium.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(upgradeToPremium.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to upgrade to premium'
      })
      // upgradeToAdmin
      .addCase(upgradeToAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(upgradeToAdmin.fulfilled, (state, action) => {
        state.currentUser = action.payload
        state.isLoading = false
        state.error = null
      })
      .addCase(upgradeToAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to upgrade to admin'
      })
  },
})

export const { setUser, clearUser, setLoading, setError, updateUser } = userSlice.actions

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading
export const selectUserError = (state: { user: UserState }) => state.user.error
export const selectIsLoggedIn = (state: { user: UserState }) => !!state.user.currentUser
export const selectUserLevel = (state: { user: UserState }) => state.user.currentUser?.level || 'anon'
export const selectIsPremium = (state: { user: UserState }) => state.user.currentUser?.level === 'premium'
export const selectIsStandard = (state: { user: UserState }) => state.user.currentUser?.level === 'standard'
export const selectIsAdmin = (state: { user: UserState }) => state.user.currentUser?.level === 'admin'

export default userSlice.reducer