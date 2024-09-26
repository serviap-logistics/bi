import { XCircleIcon } from '@heroicons/react/20/solid';
import { classNames } from '../../utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Alert(props: {
  status: 'success' | 'info' | 'warning' | 'error';
  label: string;
  details?: string | string[];
  buttons?: [{ label: string; action: any }];
}) {
  const { status, label, details, buttons } = props;
  const status_color =
    status === 'success'
      ? 'teal'
      : status === 'info'
        ? 'blue'
        : status === 'warning'
          ? 'yellow'
          : status === 'error'
            ? 'red'
            : 'slate';
  const bg_color = `bg-${status_color}-200`;
  const text_base_color = `text-${status_color}-400`;
  const text_bold_color = `text-${status_color}-700`;
  const text_heading_color = `text-${status_color}-800`;

  return (
    <div className={classNames(`rounded-md p-4`, bg_color)}>
      <div className="flex">
        <div className="flex-shrink-0">
          {status === 'error' && (
            <XCircleIcon
              aria-hidden="true"
              className={classNames(`h-5 w-5`, text_base_color)}
            />
          )}
          {status === 'warning' && (
            <ExclamationTriangleIcon
              aria-hidden="true"
              className={classNames(`h-5 w-5`, text_base_color)}
            />
          )}
        </div>
        <div className="ml-3">
          <h3 className={classNames(`text-sm font-medium`, text_heading_color)}>
            {label}
          </h3>
          <div className={classNames(`mt-2 text-sm`, text_bold_color)}>
            {Array.isArray(details) && (
              <ul role="list" className="list-disc space-y-1 pl-5">
                {details.map((text) => (
                  <li>{text}</li>
                ))}
              </ul>
            )}
            {!Array.isArray(details) && (
              <div className={classNames(`mt-2 text-sm`, text_bold_color)}>
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
