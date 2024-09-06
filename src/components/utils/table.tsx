import {v4 as uuidv4} from 'uuid'
import { classNames } from '../../utils'

export default function Table(props: {
  columns: string[], rows: any[],
  styles?: {
    vertical_lines?: boolean,
    full_width?: boolean,
    row_height?: 'xs' | 'sm' | 'base',
    rows?: {
      remark_label: boolean,
    }
  }
}) {
  const {styles} = props
  const row_height =
      styles?.row_height === 'xs' ? 'py-2'
    : styles?.row_height === 'sm' ? 'py-3'
    : styles?.row_height === 'base' ? 'py-4'
    : 'py-4'
  const rows = {
    remark_label: styles?.rows?.remark_label ? 'font-medium' : ''
  }
  return (
    <div className={`${! styles?.full_width ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
      <div className="my-4 flow-root">
        <div className={`${! styles?.full_width ? '-mx-4 sm:-mx-6 lg:-mx-8':''} -my-2 overflow-x-auto`}>
          <div className={`inline-block min-w-full py-2 align-middle ${! styles?.full_width ? 'px-2 sm:px-4': ''}`}>
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
                    <tr key={uuidv4()} className={classNames(styles?.vertical_lines? 'divide-x divide-gray-200 ': '')}>
                      <td key={uuidv4()}
                        className={classNames(
                          "whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500",
                          row_height,
                          rows.remark_label
                        )}
                      >{row[0]}</td>
                      {row.slice(1).map((value) => (
                        <td key={uuidv4()}
                          className={classNames(
                            "whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500",
                            row_height,
                          )}
                        >{value}</td>
                      ))}
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
