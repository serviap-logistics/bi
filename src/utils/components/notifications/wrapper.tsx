import { Fragment } from 'react/jsx-runtime';
import { notification, useNotification } from './context';
import Alert from './alert';

export default function NotificationsWrapper({ children }) {
  const { notifications } = useNotification();
  // useEffect(()=> {
  //   if(notifications.length > 0){
  //     const timeout = setTimeout(()=>{
  //       removeNotification(notifications[0].id);
  //     }, 5000) // 5 segundos mostrando notificacion antes de eliminarla.

  //     return () => clearTimeout(timeout);
  //   }
  // }, [notifications, removeNotification]);

  return (
    <Fragment>
      {children}
      <section
        id="notifications-container"
        className="z-40 fixed bottom-0 mb-3 min-w-80 border border-red-300"
      >
        <div className="flex flex-col content-end h-full gap-1">
          {notifications.map((notification: notification, notification_num) => (
            <Alert
              key={notification_num}
              status={notification.status}
              label={notification.label}
            />
          ))}
        </div>
      </section>
    </Fragment>
  );
}
