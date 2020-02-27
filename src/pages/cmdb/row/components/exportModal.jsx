import React, { useState } from 'react';
import { Button, Modal, Form, Input } from 'antd';
import { connect } from 'dva';

const FormItem = Form.Item;

const ExportModal = props => {
 　
  const {
    onCancel: handleModalVisible,
    modalVisible,
    schema,
    query,
    fields,
    dispatch
  } = props;
  const [ loading, setLoading ] = useState(false);
  const [ fileName, setFileName ] = useState(schema.schema);
  const [form] = Form.useForm();

  const okHandle = async () => {
      setLoading(true)
      const fieldVals = await form.validateFields()
      dispatch({
          type: 'excel/download',
          payload: {
            ...fieldVals,
            query: query,
            fields: fields
          },
          callback: blob => {
            if (window.navigator.msSaveOrOpenBlob) {
              navigator.msSaveBlob(blob, `${fileName}.xls`);
            } else {
              const link = document.createElement('a');
              const evt = document.createEvent('MouseEvents');
              link.style.display = 'none';
              link.href = window.URL.createObjectURL(blob);
              link.download = `${fileName}.xls`
              ;
              document.body.appendChild(link); // 此写法兼容可火狐浏览器
              evt.initEvent('click', false, false);
              link.dispatchEvent(evt);
              document.body.removeChild(link);
            }
            handleModalVisible(false)
          }
      }).then(()=>{
          setLoading(false)
      })
      
  }

  return (
    <Modal
      width={640}
      bodyStyle={{
        padding: '32px 40px 48px',
      }}
      destroyOnClose
      title="导出"
      visible={modalVisible}
      onCancel={() => handleModalVisible(false)}
      footer={[
        <Button key="back" onClick={() => handleModalVisible(false)}>
          取消
        </Button>,
        <Button 
            key="submit" 
            type="primary" 
            loading={loading} 
            onClick={okHandle}
            disabled={!fileName}
        >
          确定
        </Button>,
      ]}
    >
        <Form 
            form={form}
            initialValues={{
                id: schema.schema_id,
                name: fileName
            }}
        >
            <FormItem
                name="id"
                type="hidden"
            >
                <Input type="hidden"/>
            </FormItem>
            <FormItem
                name="name"
                labelCol={{
                    span: 5,
                }}
                wrapperCol={{
                    span: 15,
                }}
                rules={[
                    {
                      required: true,
                      message: '请输入'
                    },
                ]}
                label="文件名"
            >
                <Input onChange={()=>{
                    setFileName(form.getFieldValue().name)
                }}/>
            </FormItem>
        </Form>
    </Modal>
  );
};

export default connect(({})=>({}))(ExportModal)