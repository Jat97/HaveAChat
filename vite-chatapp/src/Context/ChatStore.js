import {create} from 'zustand';

export const useChatStore = create((set) => ({
    site_error: null,
    authorized: false,
    username_error: null,
    password_error: null,
    account_tab: false,
    chat_search: [],
    selected_chat: null,
    mobileView: window.innerWidth < 768,
    setSiteError: (error) => set(() => ({siteError: error})),
    setAuthorized: (bool) => set(() => ({authorized: bool})),
    setUsernameError: (error) => set(() => ({username_error: error})),
    setPasswordError: (error) => set(() => ({password_error: error})),
    setAccountTab: () => set((state) => ({account_tab: state.account_tab ? false : true})),
    setChatSearch: (arr) => set(() => ({chat_search: arr})),
    setSelectedChat: (user) => set(() => ({selected_chat: user}))
}));