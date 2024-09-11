import { createContext, useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Login from './components/login';
import { useMsal } from '@azure/msal-react';
import {
  APP_NAVIGATION,
  app_navigation_option,
  DEFAULT_MAIN_CONTENT,
} from './settings/appSettings';

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

  const [content, setContent] = useState<{ component: any }>({
    component: navigation.find((option) => option.key === DEFAULT_MAIN_CONTENT)
      ?.main_component,
  });
  const { instance, accounts } = useMsal();

  const [isAuth, setIsAuth] = useState(false);
  const checkLogin = async () => {
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
    setContent({
      component: navigation.find((option) => option.key === key)
        ?.main_component,
    });
  };

  const handleShowSideBar = (open: boolean) => {
    setShowSideBar(open);
  };

  useEffect(() => {
    checkLogin();
  });
  useEffect(() => {
    if (accounts.length == 0) setIsAuth(false);
  }, [instance, accounts]);

  return !isAuth ? (
    <Login authCallback={setIsAuth} />
  ) : (
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
              {content?.component && <content.component />}
            </div>
          </section>
        </div>
      </SideBarContext.Provider>
    </MainContentContext.Provider>
  );
}

export default App;
