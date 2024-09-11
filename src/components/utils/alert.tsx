import { XCircleIcon } from '@heroicons/react/20/solid';
import { classNames } from '../../utils';

export default function Alert(props: {
  status: 'success' | 'info' | 'warning' | 'error';
  label: string;
  details?: string | string[];
  buttons?: [{ label: string; action: any }];
}) {
  const { status, label, details, buttons } = props;
  const status_color =
    status === 'success'
      ? 'success'
      : status === 'info'
        ? 'blue'
        : status === 'warning'
          ? 'warning'
          : status === 'error'
            ? 'red'
            : 'secondary';

  return (
    <div className={`rounded-md bg-${status_color}-200 p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {status === 'error' && (
            <XCircleIcon
              aria-hidden="true"
              className={`h-5 w-5 text-${status_color}-400`}
            />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium text-${status_color}-800`}>
            {label}
          </h3>
          <div className={`mt-2 text-sm text-${status_color}-700`}>
            {Array.isArray(details) && (
              <ul role="list" className="list-disc space-y-1 pl-5">
                {details.map((text) => (
                  <li>{text}</li>
                ))}
              </ul>
            )}
            {!Array.isArray(details) && (
              <div className={`mt-2 text-sm text-${status_color}-700`}>
                <p>{details}</p>
              </div>
            )}
            {buttons && buttons?.length > 0 && (
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  {buttons?.map((button) => (
                    <button
                      type="button"
                      className={classNames(
                        'rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
                        `bg-${status_color}-50`,
                        `text-${status_color}-800`,
                        `hover:bg-${status_color}-100`,
                        `focus:ring-${status_color}-600`,
                        `focus:ring-offset-${status_color}-50`,
                      )}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
