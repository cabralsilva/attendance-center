import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  FormInstance,
  Modal,
  Skeleton,
  Upload,
  UploadFile,
} from "antd";
import { Rule, RuleObject } from "antd/es/form";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { ReactElement, useEffect, useState } from "react";

import "./styles.scss";
import IFile from "../../models/IFile";

export const convertToBase64 = async (file: RcFile): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const handlePreview = async (file: UploadFile): Promise<string> => {
  if (!file.url && !file.preview) {
    return convertToBase64(file.originFileObj as RcFile);
  }

  return "";
};

interface CustomProps {
  form: FormInstance<any>;
  label: string;
  name: string;
  rules?: Rule[];
  value?: Partial<IFile>;
  loading?: boolean;
  iconDefault?: ReactElement;
  onChange?: (value: any) => void;
}
const DPInputFileSingle: React.FC<any> = (props: CustomProps) => {
  const {
    form,
    name,
    label,
    iconDefault,
    onChange,
    rules,
    value,
    loading,
    ...othersProps
  } = props;

  const [loadingInput, setLoadingInput] = useState(loading ?? false);
  const [file, setFile] = useState<Partial<IFile> | undefined>();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [listFile, setListFile] = useState<UploadFile[]>([]);

  const [localRules, setLocalRules] = useState<Rule[]>([]);

  const convertToBase64 = async (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await convertToBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  useEffect(() => {
    setLoadingInput(loading ?? false);
  }, [loading]);

  useEffect(() => {
    if (onChange) onChange(file);
    form.setFieldValue(name, file);
    // if (value !== undefined && file) {
    //   setLoadingInput(false);
    // }
    // if (file === null) {
    //   setLoadingInput(false);
    // }
  }, [file]);

  useEffect(() => {
    form.setFieldValue(name, value);
    setFile(value);
    if (value) {
      setListFile([
        {
          uid: "-1",
          name: value?.description
            ? `${value.description}.${value.format}`
            : "File",
          status: "done",
          url: value?.url,
        },
      ]);
      // setLoadingInput(false);
    }
  }, [value]);

  useEffect(() => {
    let newValue = value;
    if (loadingInput === true) {
      setLocalRules([]);
      return;
    }

    let rulesAux: Rule[] = [];
    if (Array.isArray(rules)) {
      rulesAux = [...rules];
    }

    setLocalRules([
      ...rulesAux,
      {
        warningOnly: true,
        validator: async (_rule: RuleObject, _value: any) => {
          if (_value instanceof Object && "description" in _value) {
            let file: IFile = _value;
            if (file.description !== newValue?.description) {
              return Promise.reject(new Error());
            }
            return Promise.resolve();
          }

          if (_value?.file?.name !== newValue?.description) {
            return Promise.reject(new Error());
          }
          if (_value?.file?.status === "removed" && newValue !== undefined) {
            return Promise.reject(new Error());
          }
          return Promise.resolve();
        },
      },
    ]);
  }, [value, loadingInput]);

  useEffect(() => {
    form.validateFields([name]);
  }, [localRules]);

  return (
    <>
      <Form.Item
        label={label ?? ""}
        name={name}
        rules={[...localRules]}
        key={(othersProps as any)?.key}
      >
        {loadingInput ? (
          (othersProps as any)?.listType === "picture-card" ||
            (othersProps as any)?.listType === "picture-circle" ? (
            <Skeleton.Image active />
          ) : (
            <Skeleton.Input active size="small" />
          )
        ) : (
          <>
            <Upload
              {...othersProps}
              onPreview={handlePreview}
              // previewFile={(file: any) => iconDefault}
              fileList={listFile}
              onRemove={(_file: UploadFile) => {
                setListFile([]);
              }}
              onChange={(info: UploadChangeParam<UploadFile>) => {
                if (info.fileList.length === 0) {
                  setFile(undefined);
                }
              }}
              beforeUpload={async (file: RcFile) => {
                let base64 = await convertToBase64(file);
                setListFile([
                  {
                    uid: Math.random().toString(),
                    name: file.name,
                    status: "done",
                    url: base64,
                  },
                ]);
                form.validateFields();
                setFile({
                  fileBase64: base64,
                  description: file.name,
                  format: file.name.slice(-3),
                });
                return false;
              }}
              maxCount={1}
              className="upload-list-inline"
            >
              {listFile.length === 0 &&
                ((othersProps as any)?.listType === "picture-card" ||
                  (othersProps as any)?.listType === "picture-circle" ? (
                  <div>
                    <PlusOutlined rev={undefined} />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                ) : (
                  <Button icon={<UploadOutlined rev={undefined} />}>
                    {label ?? "Selecione"}
                  </Button>
                ))}
            </Upload>
            {iconDefault &&
              listFile?.map((file) => (
                <div key={file.uid} className="custom-image-card">
                  {iconDefault}
                  <span>{file.name}</span>
                </div>
              ))}
          </>
        )}
      </Form.Item>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default DPInputFileSingle;
