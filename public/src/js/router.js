import router from './router/router.jsx';

import { Home } from './pages/home.jsx';

router.registerState('home', {
    url: '/',
    view: Home
});

router.otherwise('home');

export default router;