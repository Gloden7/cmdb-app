import { Table, Modal, Dropdown, Menu, message } from 'antd'
import { DownOutlined } from '@ant-design/icons';
import { connect } from 'dva'
import React from 'react'
import moment from 'moment'
import FieldForm from './FieldForm'
import Meta from './meta'

const { confirm } = Modal;

@connect(({column, loading}) => ({
  data: column.data,
  loading: loading.effects['column/fetch'],
}))
class ColumnList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      updateData: {}
    }
  }

  handleUpdate = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: "column/update",
      payload: val
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleModalVisible(false, {})
        dispatch({
          type: 'column/fetch',
          payload: {
            schema_id: val.schema_id
          }
        })
      }
    })
  }

  handleModalVisible(val, record) {
    this.setState({
      modalVisible: val,
      updateData: record
    })
  }

  handleRemove(id, schema_id) {
    const { dispatch } = this.props;
    const payload = {
      id: id
    }
    const handleOk = () => {
      dispatch({
        type: 'column/remove',
        payload: payload
      }).then(({errno, errmsg}) => {
        if (errno) {
          message.error(`${errno}, ${errmsg}.`)
        }else {
          dispatch({
            type: 'column/fetch',
            payload: {
              schema_id: schema_id
            }
          })
        }
      })
    }

    confirm({
      title: '确定删除字段吗?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: handleOk,
      onCancel() {
      },
    });
   
  }

  render() {
    const { data, loading, updateLoading } = this.props;
    const columns = [
      {
        title: '字段名',
        dataIndex: 'name',
        copyable: true,
      },
      {
        title: '字段描述',
        ellipsis: true,
        dataIndex: 'desc',
      },
      {
        title: '字段创建时间',
        dataIndex: 'createtime',
        render: (val) => {
          return moment(val*1000).format("YYYY-MM-DD HH:mm:SS")
        }
      },
      {
        title: '字段更新时间',
        dataIndex: 'updatetime',
        render: (val) => {
          return moment(val*1000).format("YYYY-MM-DD HH:mm:SS")
        }
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
                  <Menu.Item key="update"
                    onClick={() => {
                      this.handleModalVisible(true, {
                        ...record,
                        ...record.meta
                      })
                    }}
                  >更新</Menu.Item>
                  <Menu.Item key="remove"
                    onClick={() => {
                      this.handleRemove(record.id, record.schema_id)
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
      }
    ];

    return (
      <>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          expandedRowRender={record => <Meta values={record.meta} />}
        />
         
        {this.state.updateData && Object.keys(this.state.updateData).length ?(
          <FieldForm
            title={"更新字段"}
            onSubmit={this.handleUpdate}
            values={this.state.updateData}
            loading={updateLoading} 
            onCancel={() => {
              this.handleModalVisible(false, {})
            }}
            modalVisible={this.state.modalVisible}
          />
          ):null}
      </>
    )

  }
}

// export default ColumnList;
export default connect(({ table, loading }) => ({
  loading: loading.effects['column/fetch'],
  updateLoading: loading.effects['column/update'],  
}))(ColumnList);