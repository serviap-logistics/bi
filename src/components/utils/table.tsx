import { classNames, generateUUID, isObjectArray } from '../../utils';
import { Fragment, useEffect, useState } from 'react';

export type cell_data = number | string | JSX.Element;
export type cell_object = { color: string; data: cell_data | cell_data[] };
export type cell = cell_data | cell_object;
export type row = cell[];
export type group = { name: string; rows: row[] };

export default function Table(props: {
  columns: string[];
  rows: row[] | group[];
  styles?: {
    static_headers?: boolean;
    static_bottom?: boolean;
    vertical_lines?: boolean;
    full_width?: boolean;
    row_height?: 'xs' | 'sm' | 'base';
    rows?: {
      remark_label: boolean;
    };
    max_height?: string;
  };
}) {
  const { styles, columns, rows } = props;
  const [asGroups, setAsGroups] = useState(false);
  const row_height =
    styles?.row_height === 'xs'
      ? 'py-2'
      : styles?.row_height === 'sm'
        ? 'py-3'
        : styles?.row_height === 'base'
          ? 'py-4'
          : 'py-4';
  const static_bottom = styles?.static_bottom ?? false;
  const rows_styles = {
    remark_label: styles?.rows?.remark_label ? 'font-medium' : '',
  };
  const num_columns = props.columns.length;
  const [data, setData] = useState<group[]>();

  useEffect(() => {
    if (rows) {
      console.log('New ROWS! ', rows);
      setAsGroups(isObjectArray(rows));
      setData(
        isObjectArray(rows)
          ? ((rows ?? []) as group[])
          : ([{ name: 'Default', rows: rows as row[] }] as group[]),
      );
    }
  }, [rows]);

  return (
    data &&
    data?.length > 0 && (
      <div
        className={classNames(
          `${!styles?.full_width ? 'px-4 sm:px-6 lg:px-8' : ''}`,
        )}
      >
        <div className="mt-4 flow-root">
          <div
            className={classNames(
              `${!styles?.full_width ? '-mx-4 sm:-mx-6 lg:-mx-8' : ''}`,
              `-my-2 overflow-x-auto`,
              `${styles?.max_height ? 'overscroll-none' : ''} `,
            )}
          >
            <div
              className={classNames(
                `inline-block min-w-full py-2 align-middle`,
                `${!styles?.full_width ? 'px-2 sm:px-4' : ''}`,
                styles?.max_height ?? '',
                styles?.max_height ? 'overflow-y-scroll' : '',
              )}
            >
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table
                  className={`min-w-full divide-y divide-gray-300 min-h-[30rem]`}
                >
                  <thead
                    className={classNames(
                      'bg-gray-50',
                      styles?.static_headers
                        ? 'absolute w-full -mt-2 pr-[16px]'
                        : '',
                    )}
                  >
                    <tr
                      className={classNames(
                        `${styles?.static_headers ? `grid grid-cols-${num_columns}` : ''}`,
                      )}
                    >
                      {columns.map((column_name, column_num) => (
                        <th
                          key={generateUUID()}
                          scope="col"
                          className={classNames(
                            'py-3.5 text-left text-sm font-semibold text-gray-900',
                            column_num === 0
                              ? 'pl-4 pr-3 sm:pl-6'
                              : 'px-3 text-center',
                            styles?.static_headers ? 'sticky top-0' : '',
                          )}
                        >
                          {column_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={classNames(
                      'divide-y divide-gray-200 bg-white mb-14',
                      styles?.static_headers
                        ? 'flex flex-col mt-10 w-full'
                        : '',
                    )}
                  >
                    {data?.map((group: group) => (
                      <Fragment key={group.name}>
                        {/* Formato SIN GRUPOS */}
                        {/* Todas las filas excepto la ultima (si se indica un static_bottom) */}
                        {!asGroups &&
                          group.rows
                            .slice(0, static_bottom ? -1 : undefined)
                            .map(
                              (row: row) =>
                                row.length > 0 && (
                                  <tr
                                    key={generateUUID()}
                                    className={classNames(
                                      styles?.vertical_lines
                                        ? 'divide-x divide-gray-200 '
                                        : '',
                                      styles?.static_headers
                                        ? `grid grid-cols-${num_columns}`
                                        : '',
                                    )}
                                  >
                                    <td
                                      key={generateUUID()}
                                      className={classNames(
                                        'whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500',
                                        row_height,
                                        rows_styles.remark_label,
                                      )}
                                    >
                                      {row[0] as cell_data}
                                    </td>
                                    {row.slice(1).map((value) => (
                                      <td
                                        key={generateUUID()}
                                        className={classNames(
                                          'whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500',
                                          row_height,
                                        )}
                                      >
                                        {value as cell_data}
                                      </td>
                                    ))}
                                  </tr>
                                ),
                            )}
                        {/* Formato para la ultima fila como estatica. */}
                        {!asGroups &&
                          static_bottom &&
                          group.rows.slice(-1).map(
                            (row: row) =>
                              row.length > 0 && (
                                <tr
                                  key={generateUUID()}
                                  className={classNames(
                                    styles?.vertical_lines
                                      ? 'divide-x divide-gray-200 '
                                      : '',
                                    static_bottom
                                      ? `absolute bottom-0 w-full -mb-2 pr-[16px] bg-white`
                                      : '',
                                  )}
                                >
                                  <td
                                    className={
                                      styles?.static_bottom
                                        ? 'grid grid-cols-5 w-full'
                                        : 'flex flex-row'
                                    }
                                  >
                                    <div
                                      key={generateUUID()}
                                      className={classNames(
                                        'whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500',
                                        row_height,
                                        rows_styles.remark_label,
                                      )}
                                    >
                                      {row[0] as cell_data}
                                    </div>
                                    {row.slice(1).map((value) => (
                                      <div
                                        key={generateUUID()}
                                        className={classNames(
                                          'whitespace-nowrap pl-4 sm:pl-6 pr-3 text-sm text-gray-500',
                                          row_height,
                                        )}
                                      >
                                        {value as cell_data}
                                      </div>
                                    ))}
                                  </td>
                                </tr>
                              ),
                          )}

                        {/* Formato CON GRUPOS */}
                        {/* Nombre de cada grupo */}
                        {asGroups && (
                          <tr className="border-t border-gray-200">
                            <th
                              scope="colgroup"
                              colSpan={num_columns}
                              className="bg-gray-50 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
                            >
                              {group.name}
                            </th>
                          </tr>
                        )}
                        {/* Formato para cada renglon del grupo */}
                        {asGroups &&
                          group.rows.map((group_row: cell[]) => (
                            <tr
                              key={generateUUID()}
                              className={classNames(
                                styles?.vertical_lines
                                  ? 'divide-x divide-gray-500 '
                                  : '',
                                styles?.static_headers
                                  ? `grid grid-cols-${num_columns}`
                                  : '',
                              )}
                            >
                              {group_row.map((cell, cell_num) => (
                                <Fragment>
                                  {cell_num === 0 && (
                                    <td
                                      key={generateUUID() + cell_num}
                                      className={classNames(
                                        'whitespace-nowrap px-4 sm:pl-6 text-sm text-gray-500',
                                        row_height,
                                        rows_styles.remark_label,
                                      )}
                                    >
                                      {(cell as cell_object).data}
                                    </td>
                                  )}
                                  {cell_num > 0 && (
                                    <td
                                      key={generateUUID() + cell_num}
                                      className={classNames(
                                        'whitespace-nowrap px-2 text-sm text-gray-500',
                                        row_height,
                                        (cell as cell_object).color,
                                      )}
                                    >
                                      <div
                                        className={classNames(
                                          'flex justify-center divide-x',
                                        )}
                                      >
                                        {Array.isArray(
                                          (cell as cell_object).data,
                                        ) &&
                                          (
                                            (cell as cell_object)
                                              .data as cell_data[]
                                          ).map((value) => (
                                            <div className="px-3">{value}</div>
                                          ))}
                                      </div>
                                    </td>
                                  )}
                                </Fragment>
                              ))}
                            </tr>
                          ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
