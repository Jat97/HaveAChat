import {create} from 'zustand';

export const useChatStore = create((set) => ({
    siteError: null,
    usernameError: null,
    passwordError: null,
    mobileView: false,
    setSiteError: (error) => set((state) => ({siteError: state.siteError = error})),
    setUsernameError: (error) => set((state) => ({pageError: state.pageError = error})),
    setPasswordError: (error) => set((state) => ({passwordError: state.passwordError = error})),
    setMobileView: (bool) => set((state) => ({mobileView: state.mobileView}))
}));