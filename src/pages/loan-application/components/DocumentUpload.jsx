import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DocumentUpload = ({ uploadedDocuments, onDocumentUpload, onDocumentRemove }) => {
    const [dragOver, setDragOver] = useState(null);

    const requiredDocuments = [
        {
            id: 'income-verification',
            name: 'Income Verification',
            description: 'Recent pay stubs, tax returns, or employment letter',
            icon: 'FileText',
            required: true
        },
        {
            id: 'bank-statements',
            name: 'Bank Statements',
            description: 'Last 3 months of bank statements',
            icon: 'Building2',
            required: true
        },
        {
            id: 'identification',
            name: 'Government ID',
            description: 'Driver\'s license, passport, or state ID',
            icon: 'CreditCard',
            required: true
        },
        {
            id: 'credit-report',
            name: 'Credit Report',
            description: 'Recent credit report (optional - we can pull this)',
            icon: 'BarChart3',
            required: false
        },
        {
            id: 'additional-income',
            name: 'Additional Income',
            description: 'Documentation for rental, investment, or other income',
            icon: 'TrendingUp',
            required: false
        }
    ];

    const handleDragOver = (e, docId) => {
        e?.preventDefault();
        setDragOver(docId);
    };

    const handleDragLeave = (e) => {
        e?.preventDefault();
        setDragOver(null);
    };

    const handleDrop = (e, docId) => {
        e?.preventDefault();
        setDragOver(null);
        const files = Array.from(e?.dataTransfer?.files);
        files?.forEach(file => {
            if (file?.type?.includes('pdf') || file?.type?.includes('image')) {
                onDocumentUpload(docId, file);
            }
        });
    };

    const handleFileSelect = (e, docId) => {
        const files = Array.from(e?.target?.files);
        files?.forEach(file => {
            onDocumentUpload(docId, file);
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
    };

    const getUploadedFiles = (docId) => {
        return uploadedDocuments?.filter(doc => doc?.category === docId);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Document Upload</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload required documents to complete your loan application. All documents are encrypted and secure.
                </p>
            </div>
            <div className="space-y-4">
                {requiredDocuments?.map((doc) => {
                    const uploadedFiles = getUploadedFiles(doc?.id);
                    const isUploaded = uploadedFiles?.length > 0;
                    return (
                        <div key={doc?.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${
                                        isUploaded ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        <Icon name={doc?.icon} size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-medium text-foreground">{doc?.name}</h4>
                                            {doc?.required && (
                                                <span className="text-xs bg-error/10 text-error px-2 py-1 rounded">Required</span>
                                            )}
                                            {isUploaded && (
                                                <Icon name="CheckCircle" size={16} className="text-success" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{doc?.description}</p>
                                    </div>
                                </div>
                            </div>
                            {/* Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center banking-transition ${
                                    dragOver === doc?.id
                                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                                }`}
                                onDragOver={(e) => handleDragOver(e, doc?.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, doc?.id)}
                            >
                                <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Drag and drop files here, or click to select
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Supported formats: PDF, JPG, PNG (Max 10MB per file)
                                </p>
                                <input
                                    type="file"
                                    id={`file-${doc?.id}`}
                                    className="hidden"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileSelect(e, doc?.id)}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => document.getElementById(`file-${doc?.id}`)?.click()}
                                    iconName="Plus"
                                    iconPosition="left"
                                >
                                    Select Files
                                </Button>
                            </div>
                            {/* Uploaded Files */}
                            {uploadedFiles?.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <h5 className="text-sm font-medium text-foreground">Uploaded Files:</h5>
                                    {uploadedFiles?.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Icon name="File" size={16} className="text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{file?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file?.size)} • Uploaded {file?.uploadDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDocumentRemove(file?.id)}
                                                iconName="Trash2"
                                                className="text-error hover:text-error"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                    <Icon name="Shield" size={20} className="text-primary mt-0.5" />
                    <div>
                        <h4 className="font-medium text-foreground">Document Security</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            All uploaded documents are encrypted using bank-level security protocols.
                            Your personal information is protected and will only be used for loan processing purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;
