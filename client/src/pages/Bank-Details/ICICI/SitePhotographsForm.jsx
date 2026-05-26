import React, { useEffect, useState } from "react";
import { Button, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const SitePhotographsForm = ({ data, editData, extractedData, onSave, onSaveAndNext, saving }) => {
  const [form, setForm] = useState({
    sitePhotographs: [],
  });

  useEffect(() => {
    const src = (data && Object.keys(data).length > 0) ? data : (editData || {});
    const autofillData = extractedData || {};
    if (src) {
      setForm((prev) => ({
        ...prev,
        sitePhotographs: src.sitePhotographs || [],
      }));
    }
  }, [editData, data, extractedData]);

  const handleSave = () => {
    if (onSave) onSave("sitePhotographs", form);
  };

  const handleSaveAndNext = () => {
    if (onSaveAndNext) onSaveAndNext("sitePhotographs", form);
  };

  return (
    <div className="min-h-[620px] relative pb-32">
      <h3 className="text-[22px] font-semibold text-[#9b0000] mb-6">
        Site Photographs
      </h3>

      <label className="block text-[20px] text-black mb-2">
        Please upload site photographs, interior and exterior photographs
        <span className="text-red-600"> *</span>
      </label>

      <Upload.Dragger
        multiple
        accept=".jpg,.jpeg,.png"
        beforeUpload={() => false}
        fileList={form.sitePhotographs}
        onChange={({ fileList }) =>
          setForm((prev) => ({ ...prev, sitePhotographs: fileList }))
        }
        className="icici-site-upload"
        showUploadList
      >
        <div className="h-[520px] flex flex-col items-center justify-center text-center">
          <UploadOutlined className="text-[30px] text-[#444] mb-5" />

          <p className="text-[28px] text-[#444] mb-5">
            Drag & Drop / Upload Photo <span className="text-red-600">*</span>
          </p>

          <p className="text-[20px] text-[#444]">
            Please upload site photographs, interior and exterior photographs
          </p>
        </div>
      </Upload.Dragger>

      <p className="text-[15px] text-black mt-1">
        * Supported file formats are JPEG, JPG, PNG (Maximum file size 500 KB)
      </p>

      <div className="absolute right-0 bottom-0 flex gap-3">
        <Button
          onClick={handleSave}
          loading={saving}
          className="h-[38px] px-6 text-sm font-medium rounded-[4px] border-[#003b70] text-[#003b70]"
        >
          Save
        </Button>
        <Button
          type="primary"
          onClick={handleSaveAndNext}
          loading={saving}
           style={{
              backgroundColor: "#1b3a6b",
              borderColor: "#1b3a6b",
           }}
          className="h-[38px] px-6 text-sm font-medium rounded-[4px] bg-[#003b70] hover:bg-[#003b70] text-white"
        >
          Save & Next
        </Button>
      </div>
    </div>
  );
};

export default SitePhotographsForm;
