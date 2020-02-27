import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Form, Input, Modal, Select, Button, InputNumber, DatePicker, Col } from 'antd';
import { connect } from 'dva';
import moment from 'moment'

const FormItem = Form.Item;

const genRule = (meta, ref) => {
  const rule ={
    required: !meta.nullable,
    message: "请输入"
  }
  if (ref) {
    rule.message = "请选择"
  }
  if (meta.len) {
    Object.assign(rule, {
      max: meta.len,
      message: `最多输入${meta.len}个字符`
    })
  }
  return [rule]
}
 
const genInput = (meta) => {
  if (meta.type == "Int") {
    if (meta.min&&meta.max) {
      return <InputNumber min={meta.min} max={meta.max} />
    } else if (meta.min) {
      return <InputNumber min={meta.min} />
    } else if (meta.max) {
      return <InputNumber max={meta.max} />
    }
    return <InputNumber />
  }else if (meta.type == "Date"){
    return (
      <DatePicker 
        style={{
          width: '100%',
        }}
        format="YYYY-MM-DD"
      />
    )
  }else if(meta.type == "DateTime") {
    return (
      <DatePicker
        style={{
          width: '100%',
        }}
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择时间"
        onOk={value=>value.format("YYYY-MM-DD HH:mm:ss")}
      />
    )
  }
   
  return <Input />
}

const genArr = (index) => {
  let arr = []
  for (let i=0; i<index; i++) arr.push(i)
  return arr
}

const EntityForm = props => {
  const [refLoading, setRefLoading] = useState({})
  
  const [form] = Form.useForm();
  const { modalVisible, onSubmit: handleAdd, onCancel, title, fields, refFields, refPagination, values } = props;
  const tps = fields.filter(val=>val.meta.type=="Date"||val.meta.type=="DateTime" )
  const mts = fields.filter(val=>val.meta.multiple&&!val.ref).map(val=>val.name)

  const defaultMts = {};
  for (let mt of mts) {
    defaultMts[mt] = values[mt]&&values[mt].length>1?genArr(values[mt].length-1):[];
  }
   
  const [multiValCount, setMultiValueCount] = useState(defaultMts)

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    const fieldsKey = Object.keys(fieldsValue)
    
    for (let mt of mts) {
      let keys = fieldsKey.filter(val=>val.startsWith(mt))
      let vals = keys.map(key=>fieldsValue[key]).filter(v=>v)
      fieldsValue[mt] = vals
    }
    for (let tp of tps) {
      let src = fieldsValue[tp.name]
      let type = tp.meta.type
       
      if (Array.isArray(src)) {
        fieldsValue[tp.name] = src.map(val=>val.format(type=="DateTime"?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD"))
      }else {
        fieldsValue[tp.name] = src&&src.format(type=="DateTime"?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD")
      }
      
    }

    handleAdd({ id: fieldsValue.id, schema_id: fieldsValue.schema_id, values: fieldsValue});
  };

  const genDefaultValue = () => {
     
    for (let tp of tps) {
      if (Array.isArray(values[tp.name])) {
        values[tp.name] = values[tp.name].map(v => moment(v, tp.meta.type=="DateTime"?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD"))
      }else {
        values[tp.name] = moment(values[tp.name], tp.meta.type=="DateTime"?"YYYY-MM-DD HH:mm:ss":"YYYY-MM-DD")
      }
    }
    for (let mt of mts) {
      if (Array.isArray(values[mt])) {
        let vals = values[mt]
        for(let i=0;i<values[mt].length-1;i++) {
          values[`${mt}${i}`] = vals[i+1]
        }
        values[mt] = vals[0]
      }
    }
     
    return values
  }

  const popUpScroll = (field) => {
    const { page, pages } = refPagination[field]
    const { dispatch } = props;
    if (page < pages) {
      setRefLoading({
        [field]: true
      })
      dispatch({
        type: "value/append",
        payload: {
          page: page+1,
          name: field
        }
      }).then(({errno, errmsg})=>{
        setRefLoading({
          [field]: false
        })
      })
    }
  }

  const handleAddMultiValue = (field, flag, index) => {
    let mField = multiValCount[field] || []
    
    if (flag) {
      mField.length?mField.push(mField[mField.length-1]+1):mField.push(0)
      setMultiValueCount({
        ...multiValCount,
        [field]: mField
      })
    }else {
      setMultiValueCount({
        ...multiValCount,
        [field]: mField.filter(i=>i!=index)
      })
      form.setFieldsValue({
        [`${field}$index}`]: null
      })
    }
  }

  const genMultiForm = (field) => {
    let m = multiValCount[field.name]||[]
   
    return m.map(i=>(      
      <FormItem
       key={`${field.name}${i}`}
       labelCol={{
         span: 5,
       }}
       wrapperCol={{
         span: 15,
       }}
       name={`${field.name}${i}`}
       label={<CloseCircleOutlined onClick={()=>{handleAddMultiValue(field.name, false, i)}} />}
       rules={genRule(field.meta, field.ref)}
       placeholder={field.meta.default}
       >
         {genInput(field.meta, true)}
       </FormItem>
    ))
  }
  

  return (
    <Modal
      destroyOnClose
      title={title}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
    >
      <Form 
        form={form}
        initialValues={values.id?genDefaultValue():values}
      >
        <FormItem
          name="id"
          type="hidden"
        >
          <Input type="hidden"/>
        </FormItem>
        <FormItem
          name="schema_id"
          type="hidden"
          style={{
            display: "none"
          }}
        >
          <Input type="hidden" />
        </FormItem>
        {fields.map(field => (
          <>
          <FormItem
            key={field.name}
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            name={field.name}
            label={field.name}
            rules={genRule(field.meta, field.ref)}
            placeholder={field.meta.default}
          >
            {field.ref?(
              <Select 
                mode={field.meta.multiple?"multiple":false}
                onPopupScroll={() => popUpScroll(field.name)}
                loading={refLoading[field.name]}
              >
                {refFields[field.name]?(
                  refFields[field.name].map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)
                ):null}
              </Select>
            ):(
              genInput(field.meta)
            )}
          </FormItem>
          {field.meta.multiple&&!field.ref&&multiValCount[field.name]?(
            genMultiForm(field)
          ):null}
          {field.meta.multiple&&!field.ref?(
            <Col xs={{ span: 15, offset: 5 }}>
              <Button 
                type="dashed" 
                style={{ width: '100%', marginBottom: 24 }}
                onClick={() => handleAddMultiValue(field.name, true)}
              >
                <PlusOutlined />
                  Add Value
                </Button>
            </Col>
          ):null}
          </>
        ))}
      </Form>
    </Modal>
  );
};

export default connect(({ value })=>({
  refFields: value.data,
  refPagination: value.pagination,
}))(EntityForm);
