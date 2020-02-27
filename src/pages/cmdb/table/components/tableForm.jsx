import React, { useState } from 'react';
import { Form, Input, Modal, Button } from 'antd';
const FormItem = Form.Item;

const TableForm = props => {
  const [formVals, setFormVals] = useState({
    id: props.values.id,
    name: props.values.name,
    desc: props.values.desc
  }); 
  
  const { modalVisible, onSubmit: handleAdd, onCancel, title, loading } = props;

  const [form] = Form.useForm();

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    setFormVals({})
    handleAdd(fieldsValue);
  };

  return (
    <Modal
      destroyOnClose
      title={title}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={okHandle}>
          确定
        </Button>,
      ]}
    >
      <Form 
        form={form}
        initialValues={{
          id: formVals.id,
          name: formVals.name,
          desc: formVals.desc
        }}
      >
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
          label="表名"
          name="name"
          rules={[
            {
              required: true,
              message: '请输入'
            },
          ]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 15,
          }}
          label="描述"
          name="desc"
          rules={[
            {
              required: true,
              message: '请输入至少三个字符的描述！',
              min: 3,
            },
          ]}
        >
          <Input placeholder="请输入" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default TableForm;
