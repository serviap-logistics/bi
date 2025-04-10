import { useState } from 'react';
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';
import { CheckIcon } from '@heroicons/react/20/solid';
import { classNames } from '..';

export type SimpleSelectOption = {
  id: number | string;
  name: string;
  default?: boolean;
};

export default function SimpleSelect(props: {
  label?: string;
  defaultID?: string;
  options: SimpleSelectOption[];
  onSelectCallback: any;
  styles?: {
    width?: string;
    colors?: {
      input?: {
        text?: string;
        background?: string;
        outline?: string;
        outlineFocus?: string;
      };
      options: {
        text?: string;
        background?: string;
      };
    };
  };
}) {
  const {
    label,
    defaultID,
    options,
    onSelectCallback,
    styles = { width: 'sm:w-80' },
  } = props;
  const defaultOption = options.find((option) => option.id === defaultID);
  const [selectedOption, setSelectedOption] = useState<
    SimpleSelectOption | undefined
  >(defaultOption);

  const handleSelect = (option: SimpleSelectOption) => {
    setSelectedOption(option);
    onSelectCallback(option.id);
  };

  return (
    <Listbox value={selectedOption} onChange={handleSelect}>
      {label ?? (
        <Label
          className={classNames('block text-sm/6 font-medium text-gray-900')}
        >
          {label}
        </Label>
      )}
      <div
        className={classNames(
          'relative',
          label ? 'mt-2' : '',
          styles.width ?? '',
        )}
      >
        <ListboxButton
          className={classNames(
            'grid w-full cursor-default grid-cols-1 rounded-md py-1.5 pl-3 pr-2 text-left outline outline-1 -outline-offset-1 focus:outline focus:outline-2 focus:-outline-offset-2 sm:text-sm/6',
            styles.colors?.input?.text ?? 'text-gray-900',
            styles.colors?.input?.background ?? 'bg-white',
            styles.colors?.input?.outline ?? 'outline-gray-300',
            styles.colors?.input?.outlineFocus ?? 'focus:outline-indigo-600',
          )}
        >
          <span className="col-start-1 row-start-1 truncate pr-6">
            {selectedOption?.name}
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className={classNames(
            'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm',
            styles?.colors?.options.background ?? 'bg-white',
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.id}
              value={option}
              className={classNames(
                'group relative cursor-default select-none py-2 pl-3 pr-9 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none',
                styles.colors?.options.text ?? 'text-gray-900',
              )}
            >
              <span className="block truncate font-normal group-data-[selected]:font-semibold">
                {option.name}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
