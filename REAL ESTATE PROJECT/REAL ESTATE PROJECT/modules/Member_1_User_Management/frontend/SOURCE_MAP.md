# Member 1 frontend source map

Implemented JSX and CSS live in the shared React application:

- `frontend/src/pages/Member1_User/RegisterPage/RegisterPage.jsx` and `.css`
- `frontend/src/pages/Member1_User/LoginPage/LoginPage.jsx` and `.css`
- `frontend/src/pages/Member1_User/ProfilePage/ProfilePage.jsx` and `.css`
- `frontend/src/pages/Member1_User/EditProfilePage/EditProfilePage.jsx` and `.css`
- `frontend/src/api/userApi.js`, `frontend/src/context/AuthContext.jsx`

Routes: `/register`, `/login`, `/profile`, `/profile/edit`. The forms validate
required values, report API errors, show loading states, and use the shared toast
feedback system.
