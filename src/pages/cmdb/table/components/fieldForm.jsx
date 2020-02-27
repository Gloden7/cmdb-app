import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Modal, 
  Button, 
  Select, 
  Radio,
  InputNumber,
  Cascader 
} from 'antd';
import { connect } from 'dva'

const FormItem = Form.Item;

const FieldForm = props => {

  const [formVals, setFormVals] = useState({
    ...props.values,
    target: [props.values.relation.schema, props.values.relation.target],
    cascade: props.values.relation.cascade,
    update_cascade: props.values.relation.update_cascade
  })

  const [fieldType, setFieldType] = useState(
    props.values.type
  )
  const [hasRelation, setHasRelation] = useState(
    Boolean(props.values.relation.target)
  )
  const [form] = Form.useForm();
  const { 
    modalVisible,
    onSubmit: handleAdd, 
    onCancel,
    title,
    loading,
    types,
    relations
  } = props;

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    setFormVals({})
    handleAdd({
      id: fieldsValue.id,
      schema_id: fieldsValue.schema_id,
      desc: fieldsValue.desc,
      type: fieldsValue.type,
      name: fieldsValue.name,
      meta: {
        ...fieldsValue,
        relation: {
          schema: fieldsValue.target && fieldsValue.target[0],
          target: fieldsValue.target && fieldsValue.target[1],
          cascade: fieldsValue.cascade,
          update_cascade: fieldsValue.update_cascade,     
        }
      }
    });
  };

  const handleTypeChange = (val) => {
    setFieldType(val)
  }

  const handleRelationChange = (val) => {
    if (val.length) {
      setHasRelation(true)
    } else {
      setHasRelation(false)
    }
  }

  const typesKey = Object.keys(types[fieldType])

  return (
    <Modal
      destroyOnClose
      title={title}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => {
        onCancel()
        setFormVals({})
      }}
      footer={[
        <Button key="back" onClick={() => {
          onCancel()
          setFormVals({})
        }}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={okHandle}>
          确定
        </Button>,
      ]}
    >
      
      <Form 
        form={form}
        initialValues={formVals}
      >
        <FormItem
          name="schema_id"
          type="hidden"
        >
          <Input type="hidden"/>
        </FormItem>
        <FormItem
          name="id"
          type="hidden"
        >
          <Input type="hidden"/>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="字段名称"
          name="name"
          rules={[
            {
              required: true,
              message: '请输入'
            },
          ]}
        >
          <Input placeholder="请输入"/>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="字段描述"
          name="desc"
        >
          <Input placeholder="请输入"/>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="字段类型"
          name="type"
          rules={[
            {
              required: true,
              message: '请选择',
            },
          ]}
        >
          <Select
            style={{
              width: '100%',
            }}
            onChange={handleTypeChange}
          >
            {Object.keys(types).map(item =><Select.Option key={item} value={item}>{item}</Select.Option>)}
          </Select>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="关联字段"
          name="target"
        >
          <Cascader options={relations} onChange={handleRelationChange} />
        </FormItem>
        {hasRelation?(
          <>
          <FormItem
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            label="级联设置"
            name="cascade"
          >
            <Select>
              <Select.Option value="delete">级联删除</Select.Option>
              <Select.Option value="set_null">设置为空置</Select.Option>
              <Select.Option value="">不允许删除</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            label="更新级联"
            name="update_cascade"
          >
            <Select>
              <Select.Option value="update">级联更新</Select.Option>
              <Select.Option value="">不允许更新</Select.Option>
            </Select>
          </FormItem>
          </>
        ):null}

        {typesKey.includes("len")?(
          <FormItem
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            label="字段长度"
            name="len"
          >
            <InputNumber min={0} />
          </FormItem>
        ):null}
        {typesKey.includes("min")?(
          <FormItem
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            label="最小值"
            name="min"
          >
            <InputNumber />
          </FormItem>
        ):null}
        {typesKey.includes("max")?(
          <FormItem
            labelCol={{
              span: 5,
            }}
            wrapperCol={{
              span: 15,
            }}
            label="最大值"
            name="max"
          >
            <InputNumber />
          </FormItem>
        ):null}
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="允许为空"
          name="nullable"
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="唯一约束"
          name="unique"
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="多值约束"
          name="multiple"
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </FormItem>
      </Form>      
    </Modal>
  );
};

export default connect(({ table, loading }) => ({
  types: table.types,
  relations: table.relations,
}))(FieldForm);