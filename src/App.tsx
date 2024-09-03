import { createContext, useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MainContent from './components/MainContent';
import Login from './components/login';
import { ENVIROMENT } from './settings/enviroment';

export const MainContentContext = createContext<[mainContent: string, setMainContent: any]>(
  ['', () => {} ]
);

export const SideBarContext = createContext<[showSideBar: boolean, setShowSideBar: any]>(
  [ false, () => {} ]
);

function App() {
  const [showSideBar, setShowSideBar] = useState(false);
  const [mainContent, setMainContent] = useState('PURCHASES');

  const [isAuth, setIsAuth] = useState([])

  useEffect(() => {
    console.log('Mounting app...')
    console.log(ENVIROMENT)
  })

  return isAuth.length == 0
  ? <Login auth={isAuth} authCallback={setIsAuth} />
  : (
    <MainContentContext.Provider value={[mainContent, setMainContent]}>
      <SideBarContext.Provider value={[ showSideBar, setShowSideBar ]}>
        <Topbar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
        <Sidebar/>
        <MainContent />
      </SideBarContext.Provider>
    </MainContentContext.Provider>
  )
}

export default App;
