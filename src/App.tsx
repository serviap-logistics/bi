import { createContext, useEffect, useState } from 'react';
import Sidebar from './modules/layout/components/Sidebar';
import Topbar from './modules/layout/components/Topbar';
import Login from './modules/login';
import { useMsal } from '@azure/msal-react';
import AppRoutes, {
  APP_NAVIGATION,
  app_navigation_option,
  DEFAULT_MAIN_CONTENT,
} from './settings/routes';
import { ENVIROMENT } from './settings/enviroment';
import { msalInstance } from './settings/authentication';
import { AuthenticationResult } from '@azure/msal-browser';
import { BrowserRouter } from 'react-router-dom';

export const MainContentContext = createContext<string>('');
export const SideBarContext = createContext<boolean>(false);

function App() {
  const [showSideBar, setShowSideBar] = useState(false);
  const [mainContent, setMainContent] = useState(DEFAULT_MAIN_CONTENT);
  const [navigation, setNavigation] = useState<app_navigation_option[]>(
    APP_NAVIGATION.map((option) => ({
      ...option,
      current: option.key === DEFAULT_MAIN_CONTENT,
    })),
  );

  const { instance, accounts } = useMsal();

  const [isAuth, setIsAuth] = useState(false);
  const checkLogin = async () => {
    if (ENVIROMENT.LOGIN_REQUIRED !== 'TRUE') {
      setIsAuth(true);
      return;
    }
    try {
      if (accounts.length > 0) {
        const silent_request = {
          account: accounts[0],
          scopes: ['user.read'],
        };
        const auth_reponse = await instance.acquireTokenSilent(silent_request);
        if (auth_reponse.accessToken) {
          setIsAuth(true);
        }
      }
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    }
  };

  const updateNavigation = (key) => {
    setNavigation(
      navigation.map((section) => ({
        ...section,
        current: section.key === key,
      })),
    );
  };

  const handleSideBarChange = (key: string) => {
    updateNavigation(key);
    setMainContent(key);
  };

  const handleShowSideBar = (open: boolean) => {
    setShowSideBar(open);
  };

  const handleAuth = (response: AuthenticationResult) => {
    console.log('Auth res: ', response);
    if (response.account) {
      msalInstance.setActiveAccount(response.account);
    }
    setIsAuth(response.account && true);
  };

  useEffect(() => {
    checkLogin();
  });

  useEffect(() => {
    if (accounts.length == 0) setIsAuth(false);
  }, [instance, accounts]);

  return !isAuth ? (
    <Login authCallback={handleAuth} />
  ) : (
    <BrowserRouter>
      <MainContentContext.Provider value={mainContent}>
        <SideBarContext.Provider value={showSideBar}>
          <Topbar
            showSideBar={showSideBar}
            onChangeShowSideBar={handleShowSideBar}
          />
          <Sidebar
            navigation={navigation}
            onSelectCallback={handleSideBarChange}
            onChangeShowSideBar={handleShowSideBar}
          />
          <div className="lg:pl-60">
            {/* Main section */}
            <section className="py-5">
              <div className="px-4 sm:px-6 lg:px-8">
                <AppRoutes />
              </div>
            </section>
          </div>
        </SideBarContext.Provider>
      </MainContentContext.Provider>
    </BrowserRouter>
  );
}

export default App;
