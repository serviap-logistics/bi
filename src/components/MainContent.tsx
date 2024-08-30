import { useContext } from "react";
import { MainContentContext } from "../App";
import Purchases from "./purchases";
import Headcount from "./headcount";

const navigation = [
  {
    key: 'PURCHASES',
    content: <Purchases />,
  },
  {
    key: 'HEADCOUNT',
    content: <Headcount />,
  },
];
export default function MainContent(){
  const [mainContent] = useContext(MainContentContext)
  return (
    <div className="lg:pl-60">
      {/* Main section */}
      <section className="py-5">
        <div className="px-4 sm:px-6 lg:px-8">
          {navigation.find((section) => section.key === mainContent)?.content}
        </div>
      </section>
    </div>
  )
}