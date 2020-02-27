import React, { useState } from 'react';
import { 
  Table
} from 'antd';
import { connect } from 'dva'


const Meta = props => {
  const { values, relations } = props;

  const genColumns = (val) => {
    const { type, len, min, max, nullable, unique, multiple, relation } = val;
    const { schema, target, cascade, update_cascade } = relation;
    const columns = [];
    if (type){
      columns.push({
        title: '类型',
        dataIndex: 'type',
      })
    }
    if(len !== undefined) {
      columns.push({
        title: '长度',
        dataIndex: 'len',
      })
    }
    if(min !== undefined) {
      columns.push({
        title: '最小值',
        dataIndex: 'min',
      })
    }
    if(max !== undefined) {
      columns.push({
        title: '最大值',
        dataIndex: 'max',
      })
    }
    if(nullable !== undefined) {
      columns.push({
        title: '允许为空',
        dataIndex: 'nullable',
        render: val=>val?'是':'否'
      })
    }
    if(unique !== undefined) {
      columns.push({
        title: '唯一约束',
        dataIndex: 'unique',
        render: val=>val?'是':'否'
      })
    }
    if(multiple !== undefined) {
      columns.push({
        title: '多值约束',
        dataIndex: 'multiple',
        render: val=>val?'是':'否'
      })
    }
    if(schema && target) {
      columns.push({
        title: '关联字段',
        dataIndex: "relation",
        render: (val) => {
          const { schema, target } = val;
          const s = relations.find(v => v.value==schema)
          const t = s.children.find(v => v.value==target)
          return `${s.label}\\${t.label}`
        }
      })
      columns.push({
        title: '级联设置',
        dataIndex: "relation",
        render: (val) => {
          if (val.cascade === "delete") {
            return "级联删除"
          }else if(val.cascade === "set_null") {
            return "设置为空值"
          }else {
            return "不允许删除"
          }
        }
      })
      columns.push({
        title: '更新级联',
        dataIndex: "relation",
        render: (val) => {
          if (val.update_cascade === "update") {
            return "级联更新"
          } else {
            return "不允许删除"
          }
        }
      })
    }
    return columns

  }
  
  const columns = genColumns(values) 

  return (
    <Table 
      rowKey="type"
      columns={columns}
      dataSource={[values]}
      pagination={false}
    />         
  );
};

export default connect(({ table }) => ({
  relations: table.relations
}))(Meta);