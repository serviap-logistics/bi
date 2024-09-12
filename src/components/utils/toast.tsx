import { classNames } from '../../utils';

export default function Toast(props: {
  text: string;
  text_size?: string;
  color: 'success' | 'warning' | 'info' | 'error' | 'secondary' | 'none';
}) {
  const { text, color, text_size = 'text-xs' } = props;
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md px-2 py-1 font-medium ring-1 ring-inset',
        text_size,
        color === 'success'
          ? 'bg-green-50 text-green-700 ring-green-600/20'
          : color === 'warning'
            ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
            : color === 'info'
              ? 'bg-sky-50 text-sky-700 ring-sky-600/20'
              : color === 'error'
                ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
                : 'bg-gray-50 text-gray-700 ring-gray-600/20',
      )}
    >
      {' '}
      {text}
    </span>
  );
}
