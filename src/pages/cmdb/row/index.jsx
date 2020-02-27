import { DownOutlined, PlusOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, message, Modal, DatePicker, } from 'antd';
import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router'
import EntityForm from './components/entityForm';
import ManyEntityForm from './components/manyEntityModal'
import ImportModal from './components/importModal';
import ExportModal from './components/exportModal';

const { confirm } = Modal;
 
const genColumns = (val, optionRender) => {
  const columns = []
  if (val.length) {
    columns.push({
        title: 'key',
        ellipsis: true,
        dataIndex: 'key',
        hideInSearch: true,
    })
    columns.push({
      title: '创建时间',
      dataIndex: 'createtime',
      valueType: 'dateTime',
      hideInSearch: true,
      renderText: val => val*1000,
    })
    columns.push({
      title: '更新时间',
      dataIndex: 'updatetime',
      valueType: 'dateTime',
      hideInSearch: true,
      renderText: val => val*1000,
    })
  }
  for (let v of val) {
    let col = {
      title: v.name,
      dataIndex: v.name,
      render: val => {
        if (Array.isArray(val)) {
          return val.map(v => <span key={v.id}>{v.value}<br/></span>)
        }
        return val.value
      }
    }
    if (v.meta.type=="Date") {
      col.renderFormItem = (_, { value, onChange })=>{
        return (<DatePicker 
          style={{
            width: '100%',
          }}
          format="YYYY-MM-DD"
          value={value}
          onChange={onChange}
        />)
      }
    }
    if (v.meta.type=="DateTime") {
      col.renderFormItem = (_, { value, onChange })=>{
        return (<DatePicker 
          style={{
            width: '100%',
          }}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={value}
          onChange={onChange}
        />)
      }
    }
    columns.push(col)
  }
  if(val.length) {
    columns.push({ 
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: optionRender
    })
  }
  
  return columns
}


class RowList extends React.Component {

  page = 1
  size = 10
  schema = this.props.location.query.schema
  schema_id = this.props.location.query.id
  query = {}

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      manyModalVisble: false,
      finishFetchCol: false,
      updateData: null,
      updateModalVisible: false,
      importModalVisible: false,
      exportModalVisible: false,
      columnsStateMap: {
        key: {
          show: false,
        },
        createtime: {
          show: false
        },
        updatetime: {
          show: false
        }
      }
    }
  }

  optionRender = (_, record) => (
    <>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="update"
              onClick={()=>{
                const values = {}
                for (let key in record) {
                  if (key!="key"&&key!="createtime"&&key!="updatetime") {
                    let value = record[key];
                    if(Array.isArray(value)){
                      values[key] = value.map(v=>v.value)
                    } else {
                      values[key] = value.value
                    }
                  }
                }
                Object.assign(values, {id: record.id})
                this.handleUpdateModalVisible(true, values)
              }}
            >更新</Menu.Item>
            <Menu.Item key="remove"
              onClick={()=>{
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
  )

  componentDidMount() {
    
    if (!this.schema_id) {
      router.replace('/404')
      return false
    }
    const { dispatch } = this.props;

    dispatch({
      type: 'row/fetch',
      payload: {
        page: this.page,
        size: this.size,
        query: this.query,
        schema_id: this.schema_id
      }
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      } 
    })
    
    dispatch({
      type: "column/fetch",
      payload: {
        schema_id: this.schema_id
      }
    }).then(({errno, errmsg}) => {
      if(errno) {
        message.error(`${errno}, ${errmsg}.`)
      } else {
        this.fetchRefValue()
      }
      this.setState({
        finishFetchCol: true,
      })
    })
  }

  handleModalVisible(val) {
    this.setState({
      modalVisible: val      
    })
  }

  handleManyModalVisible(val) {
    this.setState({
      manyModalVisible: val      
    })
  }

  handleUpdateModalVisible(val, data) {
    this.setState({
      updateModalVisible: val,
      updateData: data  
    })
  }

  handleImportModalVisible(val) {
    this.setState({
      importModalVisible: val
    })
  }

  handleExportModalVisible(val) {
    this.setState({
      exportModalVisible: val
    })
  }
  
  handleAdd = (val) => { 
    const { dispatch } = this.props;
    dispatch({
      type: 'row/add',
      payload: val
    }).then(({ errno, errmsg })=>{
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleModalVisible(false)
        this.handleReload()
      }
    })
  }

  handleManyAdd = (val) => { 
    const { dispatch } = this.props;
    dispatch({
      type: 'row/manyAdd',
      payload: val
    }).then(({ errno, errmsg })=>{
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleManyModalVisible(false)
        this.handleReload()
      }
    })
  }

  handleUpdate = (val) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'row/update',
      payload: val
    }).then(({ errno, errmsg })=>{
      if (errno) {
        message.error(`${errno}, ${errmsg}.`)
      }else {
        this.handleUpdateModalVisible(false, null)
        this.handleReload()
      }
    })
  }

  handleRemove = (id) => {
    const { dispatch } = this.props;
    const payload = {
      id: id
    }
    const handleOk = () => {
      dispatch({
        type: 'row/remove',
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
      title: '确定删除记录吗?',
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
      type: 'row/fetch',
      payload: {
        page: this.page,
        size: this.size,
        query: this.query,
        schema_id: this.schema_id
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

  fetchRefValue() {
    const { columnData, dispatch } =  this.props;
    const fields = columnData.filter(val=>val.ref)
    for (let field of fields) {
      dispatch({
        type: "value/fetch",
        payload: {
          ref: field.ref,
          name: field.name
        }
      })
    }
  }

  render() {
    const { data, columnData, deleting, adding, manyAdding, updating, loading, pagination } = this.props;   
    const columns = genColumns(columnData, this.optionRender);
    return (
      <PageHeaderWrapper>
        {this.state.finishFetchCol?(
          <ProTable
            headerTitle={<Link to="/cmdb/table">{this.schema}</Link>}
            rowKey="id"
            columnsStateMap={this.state.columnsStateMap}
            onColumnsStateChange={(stateMap) => {
              this.setState({
                columnsStateMap: stateMap
              })
            }}
            beforeSearchSubmit={(vals) => {
               
              let ds = columnData.filter(item=>item.meta.type=="Date").map(item=>item.name)
              for (let d of ds) {
                if (vals[d])
                  vals[d] = vals[d]&&vals[d].split(" ")[0]
              }
              this.query = vals
              this.handleReload()
              return true
            }}
            toolBarRender={(action, { selectedRows, selectedRowKeys }) => {
              action.reload = this.handleReload;
              return [  
                <Button type="primary" 
                onClick={() => this.handleModalVisible(true)}
                 >
                <PlusOutlined /> 新建
                </Button>,
                <Button type="primary" 
                onClick={() => this.handleManyModalVisible(true)}
                 >
                  <PlusOutlined /> 批量新建
                </Button>,
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="import"
                        onClick={()=>{this.handleImportModalVisible(true)}}
                      >
                        <ImportOutlined />导入
                      </Menu.Item>
                      <Menu.Item key="export"
                        onClick={()=>{this.handleExportModalVisible(true)}}
                      >
                        <ExportOutlined />导出
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button>
                    Excel操作 <DownOutlined />
                  </Button>
                </Dropdown>,
                selectedRowKeys && selectedRowKeys.length > 0 && (
                  <Dropdown
                    overlay={
                      <Menu
                        onClick={(e) => {
                          if (e.key === 'remove') {
                            for(let id of selectedRowKeys)
                              this.handleRemove(id)
                          }
                        }}
                        selectedKeys={[]}
                      >
                        <Menu.Item key="remove">批量删除</Menu.Item>
                        {/* <Menu.Item key="approval">批量导出</Menu.Item> */}
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
            loading={loading||deleting}
            columns={columns}
            dataSource={data}
            rowSelection={{}}
            pagination={{
              total: pagination.pages,
              showSizeChanger: true,
              onShowSizeChange: this.handleShowSizeChange,
              onchange: this.handlePageChange
            }}
          />
        ):null}
        {columnData?(
          <EntityForm
            title="新增记录"
            fields={columnData}
            onSubmit={this.handleAdd}
            onCancel={() => this.handleModalVisible(false)}
            loading={adding}
            values={{ schema_id: this.schema_id }}
            modalVisible={this.state.modalVisible}
          />
        ):null}
        {columnData?(
          <ManyEntityForm
            title="批量新增记录"
            fields={columnData}
            onSubmit={this.handleManyAdd}
            onCancel={() => this.handleManyModalVisible(false)}
            loading={manyAdding}
            values={{ schema_id: this.schema_id }}
            modalVisible={this.state.manyModalVisible}
          />
        ):null}
        {columnData&&this.state.updateData?(
          <EntityForm
            title="更新记录"
            fields={columnData}
            onSubmit={this.handleUpdate}
            onCancel={() => this.handleUpdateModalVisible(false)}
            loading={updating}
            values={this.state.updateData}
            modalVisible={this.state.updateModalVisible}
          />
        ):null}
        <ImportModal 
          onCancel={() => this.handleImportModalVisible(false)}
          modalVisible={this.state.importModalVisible}
          schema={this.schema_id}
          reload={this.handleReload}
        />
        <ExportModal 
          onCancel={() => this.handleExportModalVisible(false)}
          modalVisible={this.state.exportModalVisible}
          schema={{
            schema_id: this.schema_id,
            schema: this.schema
          }}
          query={this.query}
          fields={columnData.map(item=>item.name).filter(item=>
            this.state.columnsStateMap[item]===undefined?true:(this.state.columnsStateMap[item].show)
          )}
        />
      </PageHeaderWrapper>
    );
  } 
}

export default connect(({ row, column, loading }) => ({
  data: row.data,
  pagination: row.pagination,
  columnData: column.data,
  loading: loading.effects['row/fetch'],
  adding: loading.effects['row/add'],
  manyAdding: loading.effects['row/manyAdd'],
  updating: loading.effects['row/update'],
  deleting: loading.effects['row/remove']
}))(RowList);