import { FC, useEffect, useState } from "react";


interface TableBodyOptions {
    orders: null | Array<Record<string, null | any>>,
    tableIndex: number,
    maxRows: number,
    tableHeaders: Record<string, string>,
    displayOrderModifier: (args: any) => void,
    showOptions: boolean
}


const TableBody: FC<TableBodyOptions> = ({ orders, tableIndex, maxRows, tableHeaders, displayOrderModifier, showOptions }) => {
    const [tableData, setTableData] = useState<Array<Record<string, any>>>(
      orders?.slice(tableIndex * maxRows, (maxRows * (tableIndex + 1)))!
    );
  
    
    useEffect(() => {
        if (tableIndex !== undefined && tableIndex !== null) {
            let slicedOrders = orders?.slice(tableIndex * maxRows, (maxRows * (tableIndex + 1))) || [];
            slicedOrders = slicedOrders.filter((order) => order !== undefined);
            setTableData(slicedOrders);
        }
    }, [tableIndex, orders]);


  return (
    <tbody style={{zIndex: 10}} id="openOrderTableBody">
      {tableData.map((order, index) => (
        <tr key={index} data-key={order.order_id}>
            {Object.keys(tableHeaders).map((key) => (
                <td key={key} data-key={key} className={key === 'realised_pnl' ? (order[key] > 0 ? 'win': 'loss') : ''}>
                    {key === 'realised_pnl' ? `$${order[key]}`: order[key]}
                </td>
            ))}

            {showOptions ? (
                <td style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="tooltip-container">
                        <span className="tooltip">Edit</span>
                        <button onClick={displayOrderModifier} style={{ backgroundColor: 'transparent', border: 'none'}} className="tooltip-icon">
                            <i className="fa-solid fa-pencil"></i>
                        </button>
                    </div>
                    <div className="tooltip-container">        
                        <span className="tooltip">Close</span>
                        <i className="tooltip-icon fa-solid fa-xmark"></i>
                    </div>
                </td>
            ) : (null)}
        </tr>
      ))}
    </tbody>
  );
};


export default TableBody;