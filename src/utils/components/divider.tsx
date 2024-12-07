export default function Divider(props: { label?: string }) {
  const { label } = props;
  return (
    <div className="relative my-2">
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-base font-semibold leading-6 text-gray-900">
          {label}
        </span>
      </div>
    </div>
  );
}
