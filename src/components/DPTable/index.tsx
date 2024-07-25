import { DownloadOutlined, EllipsisOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Pagination, Row, Table, TableProps } from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useEffect, useRef, useState } from "react";
// import { CSVLink } from "react-csv";


import { SIZE_PAGE_DEFAULT } from "../../const";
import "./styles.css";
import { IPayloadTable } from "./types";

export interface DPActionsMultipleSelection {
    show?: boolean
    title: string;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    onClick: () => void;
}

interface IProps extends TableProps<any> {
    payload: IPayloadTable<any>;
    actions?: Map<string, { enable?: (item: any) => boolean, callback: (record: any, index?: number, key?: string) => any }>;
    onChangePage?: (page: number) => void;
    exportCSV?: () => Promise<[]>;
    tags?: Map<string, JSX.Element>;
    name: string | React.ReactNode;
    showName?: boolean;
    children?: any;
    showIndex?: boolean;
    dpMultipleSelectionAction?: DPActionsMultipleSelection[]
    paging?: boolean
}
const DPTable = (props: IProps) => {
    const { showName, showIndex, name, actions, tags, onChangePage, payload, exportCSV, title, children, dpMultipleSelectionAction, paging, ...tableProps } =
        props;


    const [columnsAction, setColumnsAction] = useState<any>();
    const [columns, setColumns] = useState<ColumnsType<any>>();
    const [loadingAction, setLoadingAction] = useState<Map<string, boolean>>(new Map([]));
    const currentPage = 1;
    const isPaging = paging === undefined ? true : paging;

    const handleAction = async (record: any, index?: number, _key?: string) => {
        let map = loadingAction
        map.set(record._id, true)
        setLoadingAction(new Map(map))
        let callback = actions?.get(_key as string)?.callback;
        if (callback) {
            await callback(record, index, _key);
        }
        map.set(record._id, false);
        setLoadingAction(new Map(map));
    };

    const addColumnAction = () => {
        if (columns === undefined) {
            let columnsAux = tableProps.columns!;
            let columnIndex = [];
            if (showIndex === true) {
                columnIndex.push(
                    {
                        title: "#",
                        key: "index",
                        width: "60px",
                        render: (_: any, _stockPosition: any, index: number) =>
                            `#${index + (((currentPage ?? 1) - 1) * (payload?.paging?.limit ?? 0)) + 1}`,
                    }
                )

                columnsAux = [...columnIndex, ...columnsAux]
            }

            if (actions) {
                columnsAux?.push(
                    {
                        title: "#",
                        key: "actions",
                        width: "50px",
                        onCell: (_record, _rowIndex) => {
                            return {
                                onClick: (event) => {
                                    event.stopPropagation();
                                },
                            };
                        },
                        render: (item: any, _record: any, index: number) => {
                            let todosFalse = true;
                            actions.forEach((value: { enable?: (item: any) => boolean, callback: (record: any, index?: number, key?: string) => any }) => {
                                if (value.enable && value.enable(item) !== false) {
                                    todosFalse = false;
                                }
                            });
                            if (todosFalse) {
                                return <></>
                            }
                            return (
                                <>
                                    {loadingAction.get(item._id) ? (
                                        <LoadingOutlined rev="" style={{ fontSize: 16 }} spin />
                                    ) : (
                                        <Dropdown
                                            trigger={["click"]}
                                            menu={{
                                                items: Array.from(actions.entries()).map(([key, value]) => {
                                                    return { label: key, key, disabled: value.enable === undefined ? false : !value.enable(item) }
                                                }).filter((value) => value !== undefined) as [],
                                                onClick: async ({ key }) => {
                                                    await handleAction(item, index, key);
                                                },
                                            }}
                                        >
                                            <EllipsisOutlined
                                                rev=""
                                                style={{ transform: "rotate(90deg)", marginLeft: "16px" }}
                                            />
                                        </Dropdown>
                                    )}
                                </>
                            );
                        }
                    });
            }
            setColumns(columnsAux);
        }

        if (tableProps.columns === undefined) {
            if (children !== undefined && actions) {
                setColumnsAction(
                    <Table.Column
                        title="#"
                        key="actions"
                        width="50px"
                        onCell={(_record, _rowIndex) => {
                            return {
                                onClick: (event) => {
                                    event.stopPropagation();
                                },
                            };
                        }}
                        render={(item: any, _record: any, index: number) =>
                            <>
                                {loadingAction.get(item._id) ? (
                                    <LoadingOutlined rev="" style={{ fontSize: 16 }} spin />
                                ) : (
                                    <Dropdown
                                        trigger={["click"]}
                                        menu={{
                                            items: Array.from(actions.entries()).map(([key, value]) => {
                                                return { label: key, key, disabled: value.enable === undefined ? false : !value.enable(item) }
                                            }).filter((value) => value !== undefined) as [],
                                            onClick: async ({ key }) => {
                                                await handleAction(item, index, key);
                                            },
                                        }}
                                    >
                                        <EllipsisOutlined
                                            rev=""
                                            style={{ transform: "rotate(90deg)", marginLeft: "16px" }}
                                        />
                                    </Dropdown>
                                )}
                            </>}
                    />
                )
            }
        }
    }

    useEffect(() => {
        addColumnAction()
    }, [columns]);

    /// EXPORT CSV
    const [dataToExport, setDataToExport] = useState<any[]>();
    const [loadingExportCSV, setLoadingExportCSV] = useState<boolean>(false);
    const excelRef = useRef();
    const prepareExportCSV = async () => {
        setLoadingExportCSV(true);
        try {
            let itemsToExportAux = await exportCSV?.();
            setDataToExport(itemsToExportAux);
        } catch (error: any) {
            setLoadingExportCSV(false);
            console.error(error);
        }
    };
    useEffect(() => {
        if (dataToExport && excelRef.current && (excelRef.current as any).link) {
            setTimeout(() => {
                (excelRef.current as any).link.click();
                setLoadingExportCSV(false);
            });
        }

        if (dataToExport?.length === 0) {
            setLoadingExportCSV(false);
        }
    }, [dataToExport]);
    /// FIM EXPORT CSV

    /// RESPONSIVE CONTROL
    const [screenSize, setScreenSize] = useState<{ width: number }>({
        width: window.innerWidth,
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
            });
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
        console.log(screenSize)
    }, []);
    /// FIM RESPONSIVE CONTROL

    const renderPagination = (
        current: number,
        type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
        originalElement: React.ReactNode
    ) => {
        if (type === "prev") {
            return (
                <Button shape="round" size="small">
                    Anterior
                </Button>
            );
        }
        if (type === "next") {
            return (
                <Button shape="round" size="small">
                    Próximo
                </Button>
            );
        }
        if (type === "page") {
            return (
                <Button shape="circle" size="small">
                    {current}
                </Button>
            );
        }
        return originalElement;
    }

    const renderTotalPagination = (total: number, range: number[]) => {
        return (
            <div
                className="pagination-message"
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    marginLeft: "auto",
                }}
            >
                Exibindo {range[0]} a {range[1]} de {total}
            </div>
        );
    }

    return (
        <div className="table-deupetch-no-fixed">
            {(tags || exportCSV) && (
                <Row
                    className="dp-table-row-tags"
                    justify="space-between"
                    style={{ padding: "8px 0px" }}
                >
                    <Col order={1}>
                        {tags && (
                            <>
                                {
                                    Array.from(tags.values())
                                        .reverse()
                                        .map((element, index) => (
                                            <div key={index}>{element}</div>
                                        ))
                                }
                            </>
                        )}
                    </Col>
                </Row>
            )}
            {showName === true && (
                <Row style={{ padding: "8px 0px" }}>
                    <Col>
                        {name}
                    </Col>
                </Row>
            )}
            <Row>
                {dpMultipleSelectionAction?.filter((action: DPActionsMultipleSelection) => action.show || action.show === undefined)
                    .map((action: DPActionsMultipleSelection) => (
                        <Col order={1} key={`dp-action-multiple${action.title}`}>
                            <Button
                                onClick={action.onClick}
                                loading={action.loading ?? false}
                                disabled={action.disabled ?? false}
                                size="small"
                                icon={action.icon}
                            >
                                {action.title}
                            </Button>
                        </Col>
                    ))}
                {exportCSV && (
                    <Col order={2} flex="auto" style={{ textAlign: 'right' }}>
                        <Button
                            onClick={prepareExportCSV}
                            loading={loadingExportCSV}
                            disabled={exportCSV === undefined}
                            icon={<DownloadOutlined rev={undefined} />}
                            size="small"
                        >
                            CSV
                        </Button>
                        {
                        // dataToExport && dataToExport.length > 0 && (
                        //     <CSVLink
                        //         filename={`${name}.csv`}
                        //         data={dataToExport}
                        //         // @ts-ignore
                        //         ref={excelRef}
                        //         separator=";"
                        //     />
                        // )
                        }
                    </Col>
                )}
            </Row>
            <Row>
                <Col>
                    {payload?.paging && isPaging && (
                        <div
                            style={{
                                marginTop: "8px",
                                display: "flex",
                                justifyContent: "right",
                                paddingTop: "8px",
                                paddingBottom: "8px"
                            }}
                        >
                            <Pagination
                                current={payload.paging?.page ?? 1}
                                pageSize={payload.paging?.limit ?? SIZE_PAGE_DEFAULT}
                                total={payload.paging?.total ?? 0}
                                showSizeChanger={false}
                                itemRender={renderPagination}
                                showTotal={renderTotalPagination}
                                onChange={async (page: number) => {
                                    onChangePage!(page);
                                }}
                            />
                        </div>
                    )}
                    <Table
                        {...tableProps}
                        columns={columns}
                        dataSource={payload?.items?.map((item: any) => { return { ...item, key: item.key ?? item._id ?? Math.random() } })}
                        bordered={false}
                        showHeader
                        pagination={false}
                        rowClassName={(record: any, index: number, indent: number) => {
                            let active = record.active === false ? "dp-table-row-inactive" : ""
                            let parentValues = ""
                            if (typeof tableProps.rowClassName === 'function') {
                                parentValues = tableProps.rowClassName(record, index, indent)
                            }

                            return index % 2 === 0 ? `${parentValues} ${active} even-row` : `${parentValues} ${active} odd-row`;
                        }}
                        sticky
                    >
                        {React.Children.map(children, (child) => {
                            if (React.isValidElement(child)) {
                                return React.cloneElement(child, {
                                    // Passe as propriedades adicionais que você deseja para o conteúdo personalizado aqui
                                });
                            }
                            return child;
                        })}
                        {
                            columnsAction !== undefined && columnsAction
                        }
                    </Table>
                    {payload?.paging && isPaging && (
                        <div
                            style={{
                                marginTop: "8px",
                                display: "flex",
                                justifyContent: "right",
                                paddingTop: "8px",
                                paddingBottom: "8px"
                            }}
                        >
                            <Pagination
                                current={payload.paging?.page ?? 1}
                                pageSize={payload.paging?.limit ?? SIZE_PAGE_DEFAULT}
                                total={payload.paging?.total ?? 0}
                                showSizeChanger={false}
                                itemRender={renderPagination}
                                showTotal={renderTotalPagination}
                                onChange={async (page: number) => {
                                    onChangePage!(page);
                                }}
                            />
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default DPTable;
