import { useState, useEffect } from 'react';
import { Upload, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import api from '../api';

interface ImageUploadProps {
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    multiple?: boolean;
    maxCount?: number;
}

export default function ImageUpload({ value, onChange, multiple = false, maxCount }: ImageUploadProps) {
    const { message } = App.useApp();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false);

    // Sync fileList with value prop changes (e.g., when form resets)
    useEffect(() => {
        setIsUpdatingFromProps(true);

        if (!value || (Array.isArray(value) && value.length === 0)) {
            setFileList([]);
        } else {
            const urls = Array.isArray(value) ? value : [value];
            setFileList(urls.map((url, index) => ({
                uid: `existing-${index}-${Date.now()}`,
                name: `image-${index}`,
                status: 'done',
                url: url.startsWith('http') ? url : `${api.defaults.baseURL?.replace('/api', '')}${url}`,
                response: { url },
            })));
        }

        // Reset flag after state update
        setTimeout(() => setIsUpdatingFromProps(false), 0);
    }, [value]);

    const handlePreview = async (file: UploadFile) => {
        let src = file.url as string;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj as File);
                reader.onload = () => resolve(reader.result as string);
            });
        }
        const image = new window.Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Don't process changes that come from useEffect prop sync
        if (isUpdatingFromProps) {
            return;
        }

        setFileList(newFileList);

        // Only notify parent when all files are done or removed
        const allDoneOrError = newFileList.every(file =>
            file.status === 'done' || file.status === 'error' || file.status === 'removed'
        );

        if (allDoneOrError) {
            // Filter successfully uploaded files and extract URLs
            const uploadedUrls = newFileList
                .filter(file => file.status === 'done' && file.response)
                .map(file => file.response.url);

            if (multiple) {
                onChange?.(uploadedUrls);
            } else {
                onChange?.(uploadedUrls[0] || '');
            }
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Можно загружать только изображения!');
            return Upload.LIST_IGNORE;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Изображение должно быть меньше 5MB!');
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const customRequest = async (options: any) => {
        const { file, onSuccess, onError, onProgress } = options;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/uploads/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    onProgress({ percent });
                },
            });
            onSuccess(response.data);
            message.success('Изображение загружено успешно!');
        } catch (error) {
            console.error('Upload error:', error);
            onError(error);
            message.error('Ошибка загрузки изображения');
        }
    };

    return (
        <>
            <Upload
                customRequest={customRequest}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={beforeUpload}
                multiple={multiple}
                maxCount={maxCount}
            >
                {(!maxCount || fileList.length < maxCount) && (
                    <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Загрузить</div>
                    </div>
                )}
            </Upload>
        </>
    );
}
