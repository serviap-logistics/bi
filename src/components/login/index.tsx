import { useMsal } from '@azure/msal-react';
import logo from '../../images/favicon-ico.png';
import { InteractionStatus } from '@azure/msal-browser';

export default function Login(props: { authCallback: any }) {
  const { instance, inProgress } = useMsal();
  const { authCallback } = props;

  const handleLogin = () => {
    // El proceso de Login solo inicia si no hay ninguna interacción (flujo de autenticación) en progreso
    if (inProgress !== InteractionStatus.None) {
      return Error('Login is already in progress...');
    }
    // Si el proceso de Login no ha comenzado, se abre el Popup.
    instance
      .loginPopup({ scopes: ['user.read'] })
      .then(() => {
        authCallback(true);
      })
      .catch((error) => {
        if (
          error.name === 'BrowserAuthError' &&
          error.errorCode === 'interaction_in_progress'
        ) {
          console.error('Interaction already in progress...', error);
        }
        if (
          error.name === 'BrowserAuthError' &&
          error.errorCode === 'user_cancelled'
        ) {
          resetAuthState();
          authCallback(false);
        } else {
          console.error('Login failed ):', error);
          authCallback(false);
        }
      });
  };

  const handleLogout = () => {
    if (inProgress !== InteractionStatus.None) {
      console.log('Logout or other interaction in progress...');
      return;
    }
    sessionStorage.clear();
    localStorage.clear();
  };

  const resetAuthState = () => {
    handleLogout();
  };

  return (
    <div className="flex min-h-full h-screen flex-1">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <img
              alt="Serviap Logistics Logo"
              src={logo}
              className="h-10 w-auto"
            />
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Welcome to Serviap Logistics!
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Having trouble signing in?{' '}
              <a
                href="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Contact support
              </a>
            </p>
          </div>

          <div className="mt-10">
            <div className="mt-10">
              <div className="mt-6 grid grid-cols-1 gap-4">
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
                  onClick={handleLogin}
                  disabled={inProgress !== InteractionStatus.None}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 23 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="10" height="10" fill="#F25022" />
                    <rect x="12" width="10" height="10" fill="#7FBA00" />
                    <rect y="12" width="10" height="10" fill="#00A4EF" />
                    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                  </svg>
                  <span className="text-sm font-semibold leading-6">
                    {inProgress === InteractionStatus.None ||
                    inProgress === InteractionStatus.Logout
                      ? 'Log in with Microsoft'
                      : 'Verifying...'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt="Warehouse"
          src="https://images.unsplash.com/photo-1601598704991-eef6114775e0?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
