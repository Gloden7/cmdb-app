import { UploadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import imgURL from './tip.jpg'
import reqwest from 'reqwest';

const ImportModal = props => {
 　
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const {
    onCancel: handleModalVisible,
    modalVisible,
    schema,
    reload
  } = props;

  const forward = () => setCurrentStep(currentStep + 1);

  const backward = () => setCurrentStep(currentStep - 1);

  const handleUpload = () => {
     
    setUploading(true);
   
    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('schema_id', schema)
  
    reqwest({
      url: '/api/upload',
      method: 'POST',
      processData: false,
      data: formData,
      success: ({errno, errmsg}) => {
        setUploading(false)
        if(errno) {
          message.error(`${errno}, ${errmsg}.`)
        } else {
          setFileList([])
          message.success('导入成功.')
          handleModalVisible(false)
          reload()
        }
      },
      error: () => {
        setUploading(false)
        message.error('导入失败.');
      },
    })
     
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <>
            <Upload
              
                beforeUpload={file=>{
                    if (!file.name.endsWith('.xlsx')&&!file.name.endsWith('.xls')) {
                        message.warning("请选择后缀xlsx、xls文件")    
                        return
                    }
                    if(file.size > 5242880) {
                        message.warning("请选择<5M文件")    
                        return
                    }
                    setFileList([file])   
                    return false
                }}
                fileList={fileList}
                onRemove={()=>{
                    setFileList([])
                }}
            >
                <Button>
                <UploadOutlined /> 选择文件
                </Button>
            </Upload>,
        </>
      );
    }

    return (
        <>
            <img src={imgURL} style={{ width: '100%'}}/>
        </>
    ); 
  };

  const renderFooter = () => {
    if (currentStep === 1) {
      return (
        <>
          <Button
            style={{
              float: 'left',
            }}
            onClick={backward}
          >
            上一步
          </Button>
          <Button onClick={() => handleModalVisible(false)}>取消</Button>
          <Button 
            onClick={handleUpload}
            disabled={fileList.length === 0}
            type="primary"
            loading={uploading}
          >
            完成
          </Button>
        </>
      );
    }

    return (
      <>
        <Button onClick={() => handleModalVisible(false)}>取消</Button>
        <Button type="primary" onClick={forward}>
          下一步
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{
        padding: '32px 40px 48px',
      }}
      destroyOnClose
      title="导入"
      visible={modalVisible}
      footer={renderFooter()}
      onCancel={() => handleModalVisible(false)}
      afterClose={() => handleModalVisible()}
    >
        {renderContent()}

    </Modal>
  );
};

export default ImportModal;