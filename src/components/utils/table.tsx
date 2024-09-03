import {v4 as uuidv4} from 'uuid'

export default function Table(props: {columns: string[], rows: any[]}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="my-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle px-2 sm:px-4">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {props.columns.map((column_name) => (
                      <th key={uuidv4()} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        {column_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {props.rows.map((row) => (
                    <tr key={uuidv4()}>
                      {row.map((value) => 
                      (
                        <td key={uuidv4()} className="whitespace-nowrap pl-4 sm:pl-6 pr-3 py-4 text-sm text-gray-500">{value}</td>
                      )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}