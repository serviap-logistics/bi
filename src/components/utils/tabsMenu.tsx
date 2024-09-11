import { useState } from 'react';
import { classNames } from '../../utils';

export type tabs_menu_option_type = {
  key: string;
  current: boolean;
  name: string;
  icon?: any;
};
export default function TabsMenu(props: {
  label?: string;
  tabs: tabs_menu_option_type[];
  onSelectCallback: any;
  colorOnSelect?: string;
}) {
  const { label, tabs, onSelectCallback, colorOnSelect = 'indigo' } = props;
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
    <div className="border-b border-gray-200 pt-3">
      <div className="sm:flex sm:items-baseline">
        {label && (
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {label}
          </h3>
        )}
        <div className="mt-4 sm:ml-10 sm:mt-0">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                aria-current={tab.current ? 'page' : undefined}
                onClick={() => handleSelect(tab.key)}
                className={classNames(
                  'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium hover:cursor-pointer',
                  tab.current
                    ? `border-${colorOnSelect}-500 text-${colorOnSelect}-600`
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
