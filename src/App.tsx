import { createContext, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MainContent from './components/MainContent';

export const MainContentContext = createContext<[mainContent: string, setMainContent: any]>(
  ['', () => {} ]
);

export const SideBarContext = createContext<[showSideBar: boolean, setShowSideBar: any]>(
  [ false, () => {} ]
);

function App() {
  const [showSideBar, setShowSideBar] = useState(false);
  const [mainContent, setMainContent] = useState('PURCHASES');

  return (
    <>
      <MainContentContext.Provider value={[mainContent, setMainContent]}>
        <SideBarContext.Provider value={[ showSideBar, setShowSideBar ]}>
          <Topbar showSideBar={showSideBar} setShowSideBar={setShowSideBar} />
          <Sidebar/>
          <MainContent />
        </SideBarContext.Provider>
      </MainContentContext.Provider>
    </>
  );
}

export default App;
