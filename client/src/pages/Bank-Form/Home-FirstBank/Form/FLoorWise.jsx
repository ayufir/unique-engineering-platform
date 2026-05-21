import React, { useEffect } from "react";
import { Form, Input, Button, Row, Col, Divider } from "antd";

const FLoorWise = ({
    isEdit,
    onNext,
    onBack,
    registerSectionSubmitter,
    sectionId,
    showActionButtons = true,
    extractedData,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        const currentValues = form.getFieldsValue();
        const merged = { ...isEdit };

        if (extractedData) {
            Object.entries(extractedData).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== "") {
                    merged[key] = val;
                }
            });
        }

        if (merged) {
            const safeVal = (key, fallback = "") => {
                if (merged[key] !== undefined && merged[key] !== null && merged[key] !== "") {
                    return merged[key];
                }
                return currentValues[key] !== undefined && currentValues[key] !== null ? currentValues[key] : fallback;
            };

            form.setFieldsValue({
                gfPlan: safeVal("gfPlan"),
                gfSite: safeVal("gfSite"),
                gfRemark: safeVal("gfRemark", "NA"),

                ffPlan: safeVal("ffPlan"),
                ffSite: safeVal("ffSite"),
                ffRemark: safeVal("ffRemark", "NA"),

                sfPlan: safeVal("sfPlan"),
                sfSite: safeVal("sfSite"),
                sfRemark: safeVal("sfRemark", "NA"),

                tfPlan: safeVal("tfPlan"),
                tfSite: safeVal("tfSite"),
                tfRemark: safeVal("tfRemark", "NA"),

                fifthPlan: safeVal("fifthPlan"),
                fifthSite: safeVal("fifthSite"),
                fifthRemark: safeVal("fifthRemark", "NA"),

                totalPlan: safeVal("totalPlan"),
                totalSite: safeVal("totalSite"),
                totalRemark: safeVal("totalRemark", "NA"),
            });
        }
    }, [isEdit, extractedData, form]);

    const handleSubmit = (values) => {
        if (!onNext) return;
        onNext(values);
    };

    useEffect(() => {
        if (!registerSectionSubmitter || !sectionId) return;

        registerSectionSubmitter(sectionId, async () => form.validateFields());
    }, [registerSectionSubmitter, sectionId, form]);

    const RowInput = ({ label, plan, site, remark }) => (
        <Row gutter={16} className="mb-2">
            <Col span={6}>
                <Input value={label} disabled />
            </Col>

            <Col span={6}>
                <Form.Item name={plan}>
                    <Input placeholder="As per plan" />
                </Form.Item>
            </Col>

            <Col span={6}>
                <Form.Item name={site}>
                    <Input placeholder="As per site" />
                </Form.Item>
            </Col>

            <Col span={6}>
                <Form.Item name={remark}>
                    <Input placeholder="Remarks" />
                </Form.Item>
            </Col>
        </Row>
    );

    return (
        <div className="max-w-5xl mx-auto p-4 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-red-600">
                Floor wise built-up area
            </h2>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>

                <Divider orientation="left">Area Details</Divider>

                {/* Header */}
                <Row gutter={16} className="font-bold mb-2">
                    <Col span={6}>Floor</Col>
                    <Col span={6}>As per Plan</Col>
                    <Col span={6}>As per Site</Col>
                    <Col span={6}>Remarks</Col>
                </Row>

                <RowInput label="GF" plan="gfPlan" site="gfSite" remark="gfRemark" />
                <RowInput label="FF" plan="ffPlan" site="ffSite" remark="ffRemark" />
                <RowInput label="SF" plan="sfPlan" site="sfSite" remark="sfRemark" />
                <RowInput label="TF" plan="tfPlan" site="tfSite" remark="tfRemark" />
                <RowInput label="FF" plan="fifthPlan" site="fifthSite" remark="fifthRemark" />

                <Divider />

                <RowInput label="Total BUA" plan="totalPlan" site="totalSite" remark="totalRemark" />

                {/* Buttons */}
                {showActionButtons && (
                    <Form.Item className="text-end mt-4">
                        {onBack && (
                            <Button
                                onClick={onBack}
                                className="mr-2 px-4 py-2 bg-gray-500 text-white"
                            >
                                Back
                            </Button>
                        )}

                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                )}

            </Form>
        </div>
    );
};

export default FLoorWise;
