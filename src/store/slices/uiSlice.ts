import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, UIAction } from '../types'

const initialState: UIState = {
  modals: {
    saveModal: false,
    loadModal: false,
    settingsModal: false,
    configModal: false,
  },
  loading: {
    global: false,
    widgets: false,
    data: false,
  },
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setModal: (state, action: PayloadAction<{ modal: keyof UIState['modals']; open: boolean }>) => {
      const { modal, open } = action.payload
      state.modals[modal] = open
    },
    setLoading: (state, action: PayloadAction<{ type: keyof UIState['loading']; loading: boolean }>) => {
      const { type, loading } = action.payload
      state.loading[type] = loading
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      state.notifications.push({
        ...action.payload,
        id,
      })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.notifications = state.notifications.filter(notification => notification.id !== id)
    },
    clearAllNotifications: (state) => {
      state.notifications = []
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false
      })
    },
  },
})

export const {
  setModal,
  setLoading,
  addNotification,
  removeNotification,
  clearAllNotifications,
  closeAllModals,
} = uiSlice.actions

// Selectors
export const selectModals = (state: { ui: UIState }) => state.ui.modals
export const selectLoading = (state: { ui: UIState }) => state.ui.loading
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications

export const selectModalState = (state: { ui: UIState }, modal: keyof UIState['modals']) =>
  state.ui.modals[modal]

export const selectLoadingState = (state: { ui: UIState }, type: keyof UIState['loading']) =>
  state.ui.loading[type]

export const selectIsAnyModalOpen = (state: { ui: UIState }) =>
  Object.values(state.ui.modals).some(open => open)

export const selectIsAnyLoading = (state: { ui: UIState }) =>
  Object.values(state.ui.loading).some(loading => loading)

export default uiSlice.reducer