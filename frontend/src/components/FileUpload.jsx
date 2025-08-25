import React, { useRef } from "react";
import {
  FormControl,
  FormLabel,
  Button,
  VStack,
  HStack,
  Text,
  IconButton,
  Box,
  Badge,
} from "@chakra-ui/react";
import { Upload, X, FileText, Image, File } from "lucide-react";

const FileUpload = ({
  files,
  onFilesChange,
  label = "Chứng từ kèm theo",
  isRequired = true,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Validate file count
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Chỉ được chọn tối đa ${maxFiles} file`);
      return;
    }

    // Validate file size
    const oversizedFiles = selectedFiles.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(
        `File ${oversizedFiles.map((f) => f.name).join(", ")} vượt quá ${
          maxSize / 1024 / 1024
        }MB`
      );
      return;
    }

    onFilesChange([...files, ...selectedFiles]);
    e.target.value = null; // Reset input
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.includes("pdf")) return <FileText size={16} />;
    if (type.includes("image")) return <Image size={16} />;
    return <File size={16} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <FormControl isRequired={isRequired}>
      <FormLabel fontSize="sm">{label}</FormLabel>
      <VStack spacing={3} align="stretch">
        {/* Upload Button */}
        <Button
          leftIcon={<Upload size={16} />}
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          size="sm"
        >
          Chọn file
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* File List */}
        {files.length > 0 && (
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Đã chọn {files.length} file:
            </Text>
            {files.map((file, index) => (
              <HStack
                key={index}
                p={2}
                bg="gray.50"
                borderRadius="md"
                justify="space-between"
              >
                <HStack spacing={2}>
                  {getFileIcon(file)}
                  <VStack spacing={0} align="start">
                    <Text fontSize="sm" fontWeight="medium">
                      {file.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatFileSize(file.size)}
                    </Text>
                  </VStack>
                </HStack>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<X size={14} />}
                  onClick={() => handleRemoveFile(index)}
                  aria-label="Xóa file"
                />
              </HStack>
            ))}
          </VStack>
        )}

        {/* File Type Info */}
        <Text fontSize="xs" color="gray.500">
          Hỗ trợ: PDF, JPG, PNG, DOC, DOCX (Tối đa {maxSize / 1024 / 1024}
          MB/file)
        </Text>
      </VStack>
    </FormControl>
  );
};

export default FileUpload;
