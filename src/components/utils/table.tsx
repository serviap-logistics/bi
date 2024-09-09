import {v4 as uuidv4} from 'uuid'
import { classNames } from '../../utils'

export default function Table(props: {
  columns: string[], rows: any[],
  styles?: {
    static_headers?: boolean,
    static_bottom?: boolean,
    vertical_lines?: boolean,
    full_width?: boolean,
    row_height?: 'xs' | 'sm' | 'base',
    rows?: {
      remark_label: boolean,
    },
    max_height?: string,
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
  const num_columns = props.columns.length

  return (
    <div className={classNames(
        `${! styles?.full_width ? 'px-4 sm:px-6 lg:px-8' : ''}`,
      )}>
      <div className="mt-4 flow-root">
        <div className={`${! styles?.full_width ? '-mx-4 sm:-mx-6 lg:-mx-8':''} -my-2 overflow-x-auto ${styles?.max_height ?'overscroll-none': ''} `}>
          <div className={classNames(
            `inline-block min-w-full py-2 align-middle ${! styles?.full_width ? 'px-2 sm:px-4': ''}`,
            styles?.max_height ?? '',
            styles?.max_height ? 'overflow-y-scroll': ''
            )}>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className={`min-w-full divide-y divide-gray-300 min-h-[30rem]`}>
                <thead className={classNames( "bg-gray-50", styles?.static_headers ? 'absolute w-full -mt-2 pr-[16px]': '')}>
                  <tr className={`${styles?.static_headers? `grid grid-cols-${num_columns}`: ''}`}>
                    {props.columns.map((column_name) => (
                      <th
                        key={uuidv4()} scope="col"
                        className={classNames(
                          "py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6",
                          styles?.static_headers ? 'sticky top-0' : ''
                        )}
                      >
                        {column_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={classNames("divide-y divide-gray-200 bg-white",
                    styles?.static_headers ? "flex flex-col mt-10 w-full" : '',
                    'mb-14'
                  )}>
                  {props.rows.slice(0,styles?.static_bottom? -2:undefined).map((row) => (
                    <tr key={uuidv4()} className={classNames(
                        styles?.vertical_lines ? 'divide-x divide-gray-200 ': '',
                        styles?.static_headers ?  `grid grid-cols-${num_columns}` : '',
                      )}>
                      <td key={uuidv4()}
                        className={classNames(
                          "whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500",
                          row_height,
                          rows.remark_label,
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
                  { styles?.static_bottom && (
                    props.rows.slice(-1).map((row) => (
                      <tr key={uuidv4()} className={classNames(
                          styles?.vertical_lines ? 'divide-x divide-gray-200 ': '',
                          styles?.static_bottom ?  `absolute bottom-0 w-full -mb-2 pr-[16px] bg-white` : ''
                        )}>
                        <td className={ styles?.static_bottom ? 'grid grid-cols-5 w-full': 'flex flex-row'}>
                          <div key={uuidv4()}
                            className={classNames(
                              "whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500",
                              row_height,
                              rows.remark_label,
                            )}
                          >{row[0]}</div>
                          {row.slice(1).map((value) => (
                            <div key={uuidv4()}
                              className={classNames(
                                "whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500",
                                row_height,
                              )}
                            >{value}</div>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
