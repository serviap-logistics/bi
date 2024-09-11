import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Label,
} from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { classNames } from '../../utils';
import Toast from './toast';

export type selectOption = {
  id: number | string;
  name: string;
  color: 'success' | 'warning' | 'error' | 'info';
  toast: string;
};

export default function Select(props: {
  label: string;
  options: selectOption[];
  onSelectCallback: any;
  width?: string;
}) {
  const { label, options, onSelectCallback, width = 'sm:w-80' } = props;
  const [query, setQuery] = useState('');
  const [selectedOption, setSelectedOption] = useState<selectOption | null>(
    null,
  );

  const filteredOptions =
    query === ''
      ? options
      : options.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleSelect = (option: selectOption) => {
    setQuery('');
    setSelectedOption(option);
    onSelectCallback(option);
  };

  return (
    <Combobox
      as="div"
      value={selectedOption}
      onChange={(option: selectOption) => handleSelect(option)}
      className="z-40"
    >
      <Label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </Label>
      <div className={classNames('relative mt-2 w-full', width)}>
        <ComboboxInput
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm sm:leading-6"
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setQuery('')}
          displayValue={(option: selectOption) => option?.name}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </ComboboxButton>

        {filteredOptions.length > 0 && (
          <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <ComboboxOption
                key={option.id}
                value={option}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-gray-600 data-[focus]:text-white"
              >
                <div className="flex items-center">
                  <span
                    className={classNames(
                      'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                      option.color === 'success'
                        ? 'bg-green-400'
                        : option.color === 'warning'
                          ? 'bg-amber-400'
                          : option.color === 'info'
                            ? 'bg-sky-400'
                            : option.color === 'error'
                              ? 'bg-rose-500'
                              : 'bg-gray-400',
                    )}
                    aria-hidden="true"
                  />
                  <span className="mx-3 truncate group-data-[selected]:font-semibold">
                    {option.name}
                  </span>
                  {option.toast && (
                    <Toast text={option.toast} color={option.color} />
                  )}
                </div>

                <span className="absolute inset-y-0 right-0 hidden items-center pr-3 text-gray-700 group-data-[selected]:flex group-data-[focus]:text-white">
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                </span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
