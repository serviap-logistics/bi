import { useState } from 'react';
import { classNames } from '../../utils';

export type tabs_menu_option_type = {
  key: string;
  current: boolean;
  name: string;
  icon?: any;
};

export default function PillsMenu(props: {
  tabs: tabs_menu_option_type[];
  onSelectCallback: any;
  colorOnSelect?: string;
  default_key: string;
}) {
  const {
    tabs,
    onSelectCallback,
    default_key,
    colorOnSelect = 'indigo',
  } = props;
  const [selectedTab, setSelectedTab] = useState<string>();

  const setActiveTab = (key) =>
    tabs.map((tab) => (tab.current = tab.key === key));

  const handleSelect = (key: string) => {
    if (selectedTab !== key) {
      const selected = tabs.find((tab) => tab.key === key);
      setActiveTab(key);
      setSelectedTab(selected?.key);
      onSelectCallback(selected);
    }
  };

  return (
    <div className="py-0.5">
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          defaultValue={default_key}
          className={`block w-full rounded-md border-gray-300 focus:border-${colorOnSelect}-500 focus:ring-${colorOnSelect}-500`}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav aria-label="Tabs" className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleSelect(tab.key)}
              aria-current={tab.current ? 'page' : undefined}
              className={classNames(
                tab.current
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-600 hover:text-gray-800',
                'rounded-md px-3 py-2 text-sm font-medium',
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
