import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Dropdown, Menu, message } from 'antd';
import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import TableForm from './components/tableForm';
import FieldForm from './components/fieldForm';
import ColumnList from './components/column';
import { connect } from 'dva';
import Link from 'umi/link';

const { confirm } = Modal;

class TableList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableFormUpdateModalVisible: false,
      tableFormUpdateData: {},
      tableFormModalVisible: false,
      fieldFormModalVisible: false,
      addFieldSchemaId: null,
      expandedRowKeys: [],
      expandedRowRender: <ColumnList />,
    }
  }

  page = 1
  size = 10
  query = {}

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'table/fetch',
      payload: {
        query: this.query,
        page: this.page,
        size: this.size
      }
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      } 
    })
    dispatch({
      type: 'table/fetchTypes',
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      } 
    })
    dispatch({
      type: 'table/fetchRelations',
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      } 
    })
  }

  handleModalVisible(val) {
    this.setState({
      tableFormModalVisible: val
    })
  }

  handleUpdateModalVisible(val, data) {
    this.setState({
      tableFormUpdateModalVisible: val,
      tableFormUpdateData: data
    })
  }

  handleFieldModalVisible(val, schema_id) {
    this.setState({
      fieldFormModalVisible: val,
      addFieldSchemaId: schema_id
    })
  }

  handleAdd = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'table/add',
      payload: val
    }).then(({errno, errmsg}) => {
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleModalVisible(false)
        this.handleReload()
      }
    })
  }

  handleFieldAdd = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'column/add',
      payload: val
    }).then(({errno, errmsg}) => {
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleFieldModalVisible(false, null)
        if (this.state.expandedRowKeys == val.schema_id) {
          dispatch({
            type: 'column/fetch',
            payload: {
              schema_id: val.schema_id
            }
          })
        }  
      }
    })

  }

  handleUpdate = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'table/update',
      payload: val
    }).then(({errno, errmsg}) => {
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleUpdateModalVisible(false)
        this.handleReload()
      }
    })
  }

  handleRemove(id) {
    const { dispatch } = this.props;
    const payload = {
      id: id
    }
    const handleOk = () => {
      dispatch({
        type: 'table/remove',
        payload: payload
      }).then(({errno, errmsg}) => {
        if (errno) {
          message.error(`${errno}, ${errmsg}.`)
        }else {
          this.handleReload()
        }
      })
    }

    confirm({
      title: '确定删除数据表吗?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: handleOk,
      onCancel() {
      },
    });
   
  }

  handleReload = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'table/fetch',
      payload: {
        query: this.query,
        page: this.page,
        size: this.size
      }
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      }
    })
  }

  handleShowSizeChange = (page, size) => {
    this.page = page;
    this.size = size;
    this.handleReload()
  }

  handlePageChange = (page, size) => {
    this.page = page;
    this.size = size;
    this.handleReload()
  }

  handleExpand = (expanded, record) => {
    if (expanded) {
      const { dispatch } = this.props;
      this.setState({
        expandedRowKeys: [record.id]
      })
      dispatch({
        type: 'column/fetch',
        payload: {
          schema_id: record.id
        }
      })

    }else {
      this.setState({
        expandedRowKeys: [],
      })
    }
  }

  render() {
    const columns = [
      {
        title: '表名',
        dataIndex: 'name',
        // renderText: val => 
        // copyable: true,
        render: (val, { id }) => <Link to={`/cmdb/row?schema=${val}&id=${id}` }>{val}</Link>,
      },
      {
        title: '描述',
        ellipsis: true,
        dataIndex: 'desc',
      },
      {
        title: '创建时间',
        dataIndex: 'createtime',
        valueType: 'dateTime',
        renderText: val => val*1000,
      },
      {
        title: '更新时间',
        dataIndex: 'updatetime',
        valueType: 'dateTime',
        hideInSearch: true,
        renderText: val => val*1000,
      },
      {
        title: '操作',
        dataIndex: 'option',
        valueType: 'option',
        render: (_, record) => (
          <>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      this.handleFieldModalVisible(true, record.id)
                    }}
                  >添加字段</Menu.Item>
                  <Menu.Item key="update"
                    onClick={() => {
                      this.handleUpdateModalVisible(true, record)
                    }}
                  >更新</Menu.Item>
                  <Menu.Item key="remove"
                    onClick={() => {
                      this.handleRemove(record.id)
                    }}
                  >删除</Menu.Item>
                </Menu>
              }
            >
              <a>
                actions <DownOutlined />
              </a>
            </Dropdown>
          </>
        ),
      },
    ];
    const { data, types, loading, pagination, adding, updating, colAdding, deleting, colDeleting } = this.props;

    return (
      <PageHeaderWrapper>
        <ProTable
          headerTitle="数据表"
          rowKey="id"
          params={{ }}
          reload={this.handleReload}
          loading={loading||deleting||colDeleting}
          beforeSearchSubmit={(val) => {
            this.query = val
            this.handleReload()
            return true
          }}

          toolBarRender={(action, { selectedRows }) => {
            action.reload = this.handleReload;
            return [
            <Button type="primary" onClick={() => this.handleModalVisible(true)}>
              <PlusOutlined /> 新建
            </Button>,
            selectedRows && selectedRows.length > 0 &&
            (
              <Dropdown
                overlay={
                  <Menu
                    onClick={async e => {
                      if (e.key === 'remove') {
                        for(let record in selectedRows) {
                          this.handleRemove(record.id)
                        }
                        // await handleRemove(selectedRows);
                      }
                    }}
                    selectedKeys={[]}
                  >
                    <Menu.Item key="remove">批量删除</Menu.Item>
                  </Menu>
                }
              >
                <Button>
                  批量操作 <DownOutlined />
                </Button>
              </Dropdown>
            ),
            ]}
          }
          columns={columns}
          dataSource={data}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.handleExpand}
          expandedRowRender={({id}) => id==this.state.expandedRowKeys?this.state.expandedRowRender:true}
          pagination={{
            total: pagination.pages,
            showSizeChanger: true,
            onShowSizeChange: this.handleShowSizeChange,
            onchange: this.handlePageChange
          }}
          rowSelection={{}}
        >
        </ProTable>
        <TableForm
          title={"新建数据表"}
          onSubmit={this.handleAdd}
          loading={adding}
          values={{}}
          onCancel={() => {
            this.handleModalVisible(false)
          }}
          modalVisible={this.state.tableFormModalVisible}
        />
        {this.state.addFieldSchemaId?
        <FieldForm
          title={"新建字段"}
          onSubmit={this.handleFieldAdd}
          values={{ ...types.String, schema_id: this.state.addFieldSchemaId }}
          loading={colAdding}
          onCancel={() => {
            this.handleFieldModalVisible(false)
          }}
          modalVisible={this.state.fieldFormModalVisible}
        />:null}
        {this.state.tableFormUpdateData && Object.keys(this.state.tableFormUpdateData).length?(
        <TableForm
          title={"更新数据表"}
          onSubmit={this.handleUpdate}
          loading={updating}
          values={this.state.tableFormUpdateData}
          onCancel={() => {
            this.handleUpdateModalVisible(false, {})
          }}
          modalVisible={this.state.tableFormUpdateModalVisible}
        />):null}
      </PageHeaderWrapper>
    )
  }
}

export default connect(({ table, loading }) => ({
  data: table.data,
  pagination: table.pagination,
  types: table.types,
  loading: loading.effects['table/fetch'],
  adding: loading.effects['table/add'],
  deleting: loading.effects['table/remove'],
  updating: loading.effects['table/update'],
  colDeleting: loading.effects['column/remove'],
  colAdding: loading.effects['column/add'],
}))(TableList);
