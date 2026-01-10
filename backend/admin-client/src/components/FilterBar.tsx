import React, { useEffect, useState } from 'react';
import { Card, Flex, Row, Button, theme, Grid } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const { useToken } = theme;
const { useBreakpoint } = Grid;

interface FilterBarProps {
    children: React.ReactNode;
    actions?: React.ReactNode;
    title?: React.ReactNode;
    extra?: React.ReactNode;
    gap?: number;
    defaultOpen?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ children, actions, title, extra, gap = 12, defaultOpen = false }) => {
    const { token } = useToken();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isDarkMode = token.colorBgBase === '#141414' || document.documentElement.getAttribute('data-theme') === 'dark';
    const [open, setOpen] = useState(defaultOpen);

    useEffect(() => {
        setOpen(defaultOpen);
    }, [defaultOpen]);

    return (
        <Card
            className="filter-bar-card"
            size="small"
            styles={{ body: { padding: 12 } }}
            style={{
                marginBottom: 16,
                background: isDarkMode ? token.colorFillQuaternary : '#fafafa',
                border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#f0f0f0'}`,
                borderRadius: 10,
                boxShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
                overflow: 'visible',
            }}
        >
            <Flex vertical gap={12}>
                    <Flex justify="space-between" align="center" wrap className="filter-bar-header">
                    <div className="filter-bar-title">{title || 'Фильтры'}</div>
                    <Flex align="center" gap={8} wrap>
                        {extra}
                        <Button
                            className="filter-bar-toggle"
                            type="text"
                            size="middle"
                            onClick={() => setOpen(v => !v)}
                            icon={open ? <UpOutlined /> : <DownOutlined />}
                            style={{
                                ...(isMobile && {
                                    width: '100%',
                                    justifyContent: 'center',
                                    height: 44,
                                    fontSize: 15,
                                    border: `1px solid ${isDarkMode ? token.colorBorderSecondary : '#d9d9d9'}`,
                                    background: isDarkMode ? token.colorBgContainer : '#fff',
                                }),
                            }}
                        >
                            {open ? 'Свернуть' : 'Показать фильтры'}
                        </Button>
                    </Flex>
                </Flex>
                {open && (
                    <>
                        <Row gutter={[12, 12]} className="filter-bar-body" style={{ rowGap: gap, columnGap: gap }}>
                            {children}
                        </Row>
                        {actions && (
                            <Flex justify="flex-end" gap={8} wrap className="filter-bar-actions">
                                {actions}
                            </Flex>
                        )}
                    </>
                )}
            </Flex>
            <style>{`
                .filter-bar-card .filter-bar-title {
                    font-weight: 600;
                }

                .filter-bar-card .filter-bar-toggle {
                    padding: 6px 12px;
                    border-radius: 8px;
                }

                .filter-bar-card .filter-bar-actions .ant-btn {
                    min-width: 120px;
                }

                .filter-bar-date-dropdown .ant-picker-panel-container {
                    border-radius: 12px;
                }

                .single-panel-range .ant-picker-panels {
                    flex-direction: column;
                }

                .single-panel-range .ant-picker-panels > *:nth-child(2) {
                    display: none;
                }

                .single-panel-range .ant-picker-panel {
                    width: 100%;
                }

                @media (max-width: 1024px) {
                    .filter-bar-date-dropdown.ant-picker-dropdown {
                        width: auto;
                        min-width: 100%;
                        max-width: 100%;
                        padding: 0;
                    }

                    .filter-bar-date-dropdown .ant-picker-range-wrapper,
                    .filter-bar-date-dropdown .ant-picker-panel-container,
                    .filter-bar-date-dropdown .ant-picker-panel {
                        width: 100%;
                    }

                    .filter-bar-date-dropdown .ant-picker-panels {
                        flex-direction: column;
                    }
                }

                @media (max-width: 768px) {
                    .filter-bar-card {
                        border-radius: 12px;
                    }

                    .filter-bar-header {
                        gap: 8px;
                    }

                    .filter-bar-toggle {
                        width: 100%;
                        justify-content: center;
                        height: 44px;
                        font-size: 15px;
                    }

                    .filter-bar-body .ant-col {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }

                    .filter-bar-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .filter-bar-actions .ant-btn {
                        flex: 1;
                        height: 46px;
                        font-size: 15px;
                        border-radius: 12px;
                    }

                    .filter-bar-actions .ant-btn + .ant-btn {
                        margin-left: 8px;
                    }

                    .filter-bar-date-dropdown .ant-picker-cell-inner {
                        height: 40px;
                        line-height: 40px;
                        border-radius: 10px;
                    }

                    .filter-bar-date-dropdown .ant-picker-ranges {
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                }
            `}</style>
        </Card>
    );
};

export default FilterBar;
