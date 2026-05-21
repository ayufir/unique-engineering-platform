


import React, { useState } from "react";
import DocumentUpload from "../components/DocumentUpload";   // adjust path as needed
import PhotoPreview from "../components/PhotoPreview";       // adjust path as needed
import { Alert, Spin, message, Button } from "antd";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: safely read a nested path from an object
// ─────────────────────────────────────────────────────────────────────────────
const get = (obj, path, defaultValue = "") =>
    path
        .split(".")
        .reduce(
            (acc, part) =>
                acc && acc[part] !== undefined ? acc[part] : defaultValue,
            obj
        );

// ─────────────────────────────────────────────────────────────────────────────
// Parse a Hindi / English mixed string to extract a plain English value.
// After Hinglish AI change, most values will already be Roman script.
// Still kept as fallback for older responses.
// ─────────────────────────────────────────────────────────────────────────────
const extractEnglish = (str = "") => {
    if (!str) return "";
    const m = str.match(/\(([^)]+)\)/);
    return m ? m[1].trim() : str.trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// Build a properly formatted address string from the address object.
//
// Format:
//   Plot No. [plot_number], Khasra No. [khasra/survey], Patwari Halka No. [patwari_halka_number],
//   Ward No. [ward_number], [village_name], [colony_area], [tehsil], [district], [state], [pincode]
//
// Only includes a part if its value is present.
// ─────────────────────────────────────────────────────────────────────────────
const buildAddressString = (addr = {}) => {
    if (!addr || Object.keys(addr).length === 0) return "";

    const parts = [];

    // Plot No.
    if (addr.plot_number) {
        parts.push(`Plot No. ${addr.plot_number}`);
    }

    // Khasra No. — use khasra_number first, fallback to survey_number
    const khasra = addr.khasra_number || addr.survey_number;
    if (khasra) {
        parts.push(`Khasra No. ${khasra}`);
    }

    // Patwari Halka No.
    if (addr.patwari_halka_number) {
        parts.push(`Patwari Halka No. ${addr.patwari_halka_number}`);
    }

    // Ward No.
    if (addr.ward_number) {
        parts.push(`Ward No. ${addr.ward_number}`);
    }

    // Village Name
    if (addr.village_name) {
        parts.push(addr.village_name);
    }

    // Colony / Area
    if (addr.colony_area) {
        parts.push(addr.colony_area);
    }

    // Tehsil
    if (addr.tehsil) {
        parts.push(addr.tehsil);
    }

    // District (only if different from tehsil to avoid repetition)
    if (addr.district && addr.district !== addr.tehsil) {
        parts.push(addr.district);
    }

    // State
    if (addr.state) {
        parts.push(addr.state);
    }

    // Pincode
    if (addr.pincode) {
        parts.push(addr.pincode);
    }

    return parts.join(", ");
};

// ─────────────────────────────────────────────────────────────────────────────
// Map the raw API document object → flat field names expected by all 6 steps.
// We ALSO keep the original nested arrays (seller / buyer / property) so that
// ValuationDetails can build its remarks and analysis cards.
// ─────────────────────────────────────────────────────────────────────────────
// const mapDocumentToFormData = (doc) => {
//     if (!doc || typeof doc !== "object") return {};

//     const data = {};

//     // ── Keep raw nested data for ValuationDetails ──────────────────────────
//     data.seller = doc.seller || [];
//     data.buyer = doc.buyer || [];
//     data.property = doc.property || {};
//     data.document_type = doc.document_type || "";
//     data.registration_number = doc.registration_number || "";
//     data.registration_date = doc.registration_date || "";

//     // ══════════════════════════════════════════════════════════════════════════
//     // STEP 1 — LNTAssignmentDetails (General Details)
//     // ══════════════════════════════════════════════════════════════════════════

//     // customerName ← buyer[0].name (Hinglish, already Roman script)
//     const buyerRaw = get(doc, "buyer.0.name");
//     if (buyerRaw) data.customerName = buyerRaw;

//     // propertyOwnerName ← seller[0].name (Hinglish)
//     const sellerRaw = get(doc, "seller.0.name");
//     if (sellerRaw) data.propertyOwnerName = sellerRaw;

//     // ── Address object ────────────────────────────────────────────────────────
//     const addr = doc.property?.address || {};

//     // Build full formatted address for Legal and Site address fields
//     const formattedAddress = buildAddressString(addr);

//     if (formattedAddress) {
//         data.addressLegal = formattedAddress;
//         data.addressSite = formattedAddress;
//     }

//     // city — prefer district, fallback to tehsil
//     if (addr.district) {
//         data.city = addr.district;
//     } else if (addr.tehsil) {
//         data.city = addr.tehsil;
//     }

//     // Pin code
//     if (addr.pincode) {
//         data.projectPinCode = addr.pincode;
//     }

//     // State
//     data.projectState = addr.state || "Madhya Pradesh";

//     // propertyName — shorter readable version for the property name field
//     const propertyNameParts = [
//         addr.plot_number && `Plot No. ${addr.plot_number}`,
//         addr.colony_area,
//         addr.village_name,
//         addr.tehsil,
//         addr.district,
//     ].filter(Boolean);

//     if (propertyNameParts.length > 0) {
//         data.propertyName = propertyNameParts.join(", ");
//     }

//     // dateOfReport ← registration_date
//     if (doc.registration_date) data.dateOfReport = doc.registration_date;

//     // refNo ← registration_number
//     if (doc.registration_number) data.refNo = doc.registration_number;

//     // ── unitType ← property_type ─────────────────────────────────────────────
//     const propTypeRaw = get(doc, "property.property_type", "");
//     const propTypeLower = propTypeRaw.toLowerCase();

//     if (
//         propTypeLower.includes("house") ||
//         propTypeLower.includes("makan") ||
//         propTypeLower.includes("awas") ||
//         propTypeLower.includes("makaan")
//     ) {
//         data.unitType = "Individual House";
//     } else if (
//         propTypeLower.includes("flat") ||
//         propTypeLower.includes("apartment") ||
//         propTypeLower.includes("aparment")
//     ) {
//         data.unitType = "Flat";
//     } else if (
//         propTypeLower.includes("plot") ||
//         propTypeLower.includes("bhukhanda") ||
//         propTypeLower.includes("bhukhand") ||
//         propTypeLower.includes("bhu khand") ||
//         propTypeLower.includes("open plot") ||
//         propTypeLower.includes("bhu khanda") ||
//         propTypeLower.includes("plot land")
//     ) {
//         data.unitType = "OPEN PLOT";
//     } else if (
//         propTypeLower.includes("shop") ||
//         propTypeLower.includes("dukan") ||
//         propTypeLower.includes("dukaan")
//     ) {
//         data.unitType = "Shop";
//     } else if (propTypeLower.includes("row house")) {
//         data.unitType = "Row House";
//     } else if (propTypeLower.includes("office")) {
//         data.unitType = "Office";
//     } else if (propTypeLower.includes("industrial")) {
//         data.unitType = "Industrial";
//     } else if (propTypeRaw) {
//         data.unitType = propTypeRaw; // fallback: raw value
//     }

//     // documentsAvailable ← document_type
//     if (doc.document_type) data.documentsAvailable = doc.document_type;

//     // typeOfStructure (Step 4)
//     if (propTypeRaw) data.typeOfStructure = propTypeRaw;

//     // ── Zone / Usage ─────────────────────────────────────────────────────────
//     const propUseRaw = get(doc, "property.property_use", "");
//     if (propUseRaw) {
//         const propUseLower = propUseRaw.toLowerCase();
//         if (
//             propUseLower.includes("residential") ||
//             propUseLower.includes("aawasiya") ||
//             propUseLower.includes("awasiya") ||
//             propUseLower.includes("awas") ||
//             propUseLower.includes("rehayshi")
//         ) {
//             data.zone = "Residential";
//             data.usageOfProperty = "Residential";
//         } else if (
//             propUseLower.includes("commercial") ||
//             propUseLower.includes("vanijyik") ||
//             propUseLower.includes("vyavsayik") ||
//             propUseLower.includes("dukan")
//         ) {
//             data.zone = "Commercial";
//             data.usageOfProperty = "Commercial";
//         } else if (
//             propUseLower.includes("agricultural") ||
//             propUseLower.includes("krishi") ||
//             propUseLower.includes("khet") ||
//             propUseLower.includes("fasal")
//         ) {
//             data.zone = "Agricultural";
//             data.usageOfProperty = "Agricultural";
//         } else {
//             data.zone = propUseRaw;
//             data.usageOfProperty = propUseRaw;
//         }
//     } else {
//         // Default for open plot
//         if (data.unitType === "OPEN PLOT") {
//             data.zone = "Residential";
//             data.usageOfProperty = "Residential";
//         }
//     }

//     // ownershipType — sensible default
//     data.ownershipType = "Freehold";

//     // numberAndDate
//     if (doc.registration_number && doc.registration_date) {
//         data.numberAndDate = `${doc.registration_number} / ${doc.registration_date}`;
//     }

//     // ══════════════════════════════════════════════════════════════════════════
//     // STEP 4 — PropertyDetails (Boundaries, Dimensions, Structural Details)
//     // ══════════════════════════════════════════════════════════════════════════
//     const bounds = doc.property?.boundaries || {};

//     ["north", "south", "east", "west"].forEach((dir) => {
//         const value = bounds[dir];
//         if (value) {
//             data[`${dir}Document`] = value;
//             data[`${dir}Actual`] = value;
//             data[`${dir}Plan`] = value;
//         }
//     });

//     if (bounds.north || bounds.south || bounds.east || bounds.west) {
//         data.boundariesMatching = "Yes";
//     }

//     // Plot area
//     const plotAreaRaw = doc.property?.plot_area || "";
//     if (plotAreaRaw) {
//         const numericArea = parseFloat(plotAreaRaw.replace(/[^\d.]/g, "")) || "";
//         data.plotArea = numericArea || plotAreaRaw;
//         data.landArea = numericArea || plotAreaRaw;
//         // Valuation step area fields
//         data.landSiteArea = numericArea || plotAreaRaw;
//         data.landDocumentArea = numericArea || plotAreaRaw;
//         data.landPlanArea = numericArea || plotAreaRaw;
//     }

//     // Plot dimensions
//     const plotDimensions = doc.property?.plot_dimensions || "";
//     if (plotDimensions) {
//         data.Dimension = plotDimensions;
//         data.linearDimension = plotDimensions;
//     }

//     return data;
// };


// ... (inside AutoFillForm.js, replace the mapDocumentToFormData function with this)

const mapDocumentToFormData = (doc) => {
    if (!doc || typeof doc !== "object") return {};
    
    console.log("🔥 RAW AI EXTRACTED DATA ARRIVED AT FRONTEND:", doc);

    const data = {};
    const extractedProperty = doc.property || {};

    // ── Keep raw nested data for ValuationDetails ──────────────────────────
    data.seller = doc.seller || [];
    data.buyer = doc.buyer || [];
    data.property = extractedProperty;
    data.document_type = doc.document_type || "";
    data.registration_number = doc.registration_number || "";
    data.registration_date = doc.registration_date || "";
    data.reportRemarks = extractedProperty.report_remarks || "";

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 1 — LNTAssignmentDetails (General Details)
    // ══════════════════════════════════════════════════════════════════════════

    // customerName ← buyer[0].name
    const buyerRaw =
        extractedProperty.applicant_name || get(doc, "buyer.0.name");
    if (buyerRaw) data.customerName = buyerRaw;

    // propertyOwnerName ← seller[0].name
    const sellerRaw =
        extractedProperty.owner_name || get(doc, "seller.0.name");
    if (sellerRaw) data.propertyOwnerName = sellerRaw;

    if (extractedProperty.contact_person) {
        data.personMetDuringVisit = extractedProperty.contact_person;
    } else if (extractedProperty.duringPropertyVisit) {
        data.personMetDuringVisit = extractedProperty.duringPropertyVisit;
    }

    // ── Address object ────────────────────────────────────────────────────────
    const addr = extractedProperty.address || {};

    // Expose all individual address sub-keys for mappings
    if (addr.plot_number) data.plotNumber = addr.plot_number;
    if (addr.survey_number) data.surveyNumber = addr.survey_number;
    if (addr.khasra_number) data.khasraNumber = addr.khasra_number;
    if (addr.ward_number) data.wardNumber = addr.ward_number;
    if (addr.colony_area) data.colonyArea = addr.colony_area;
    if (addr.village_name) data.villageName = addr.village_name;
    if (addr.patwari_halka_number) data.patwariHalkaNumber = addr.patwari_halka_number;
    if (addr.tehsil) data.tehsil = addr.tehsil;
    if (addr.district) data.district = addr.district;
    if (addr.pincode) data.pincode = addr.pincode;
    if (addr.state) data.state = addr.state;
    if (addr.main_locality) data.mainLocality = addr.main_locality;
    if (addr.sub_locality) data.subLocality = addr.sub_locality;

    // Build full formatted address for Legal and Site address fields
    const formattedAddress = addr.full_address || buildAddressString(addr);

    if (formattedAddress) {
        data.addressLegal = formattedAddress;
        data.addressSite = formattedAddress;
    }

    // city — prefer district, fallback to tehsil
    if (addr.district) {
        data.city = addr.district;
    } else if (addr.tehsil) {
        data.city = addr.tehsil;
    }

    // Pin code
    if (addr.pincode) {
        data.projectPinCode = addr.pincode;
    }

    // State
    data.projectState = addr.state || "Madhya Pradesh";

    // propertyName — shorter readable version for the property name field
    const propertyNameParts = [
        addr.plot_number && `Plot No. ${addr.plot_number}`,
        addr.colony_area,
        addr.village_name,
        addr.tehsil,
        addr.district,
    ].filter(Boolean);

    if (propertyNameParts.length > 0) {
        data.propertyName = propertyNameParts.join(", ");
    }

    // dateOfReport ← registration_date
    if (doc.registration_date) {
        data.dateOfReport = doc.registration_date;
    } else if (extractedProperty.dateOfReport) {
        data.dateOfReport = extractedProperty.dateOfReport;
    }

    if (doc?.LandArea || extractedProperty.LandArea) {
        data.LandArea = doc?.LandArea || extractedProperty.LandArea;
    }

    // ══════════════════════════════════════════════════════════════════════════
    if (extractedProperty.contact_number || extractedProperty["Mobile No."]) {
        data.contactNumber =
            extractedProperty.contact_number || extractedProperty["Mobile No."];
        data.customerNo = data.contactNumber;
    }
    // refNo ← registration_number
    if (doc.registration_number) data.refNo = doc.registration_number;

    // ── unitType ← property_type ─────────────────────────────────────────────
    const propTypeRaw = get(doc, "property.property_type", "");
    const propTypeLower = propTypeRaw.toLowerCase();

    if (
        propTypeLower.includes("house") ||
        propTypeLower.includes("makan") ||
        propTypeLower.includes("awas") ||
        propTypeLower.includes("makaan")
    ) {
        data.unitType = "Individual House";
    } else if (
        propTypeLower.includes("flat") ||
        propTypeLower.includes("apartment") ||
        propTypeLower.includes("aparment")
    ) {
        data.unitType = "Flat";
    } else if (
        propTypeLower.includes("plot") ||
        propTypeLower.includes("bhukhanda") ||
        propTypeLower.includes("bhukhand") ||
        propTypeLower.includes("bhu khand") ||
        propTypeLower.includes("open plot") ||
        propTypeLower.includes("bhu khanda") ||
        propTypeLower.includes("plot land")
    ) {
        data.unitType = "OPEN PLOT";
    } else if (
        propTypeLower.includes("shop") ||
        propTypeLower.includes("dukan") ||
        propTypeLower.includes("dukaan")
    ) {
        data.unitType = "Shop";
    } else if (propTypeLower.includes("row house")) {
        data.unitType = "Row House";
    } else if (propTypeLower.includes("office")) {
        data.unitType = "Office";
    } else if (propTypeLower.includes("industrial")) {
        data.unitType = "Industrial";
    } else if (propTypeRaw) {
        data.unitType = propTypeRaw; // fallback: raw value
    }

    // documentsAvailable ← document_type
    if (doc.document_type) data.documentsAvailable = doc.document_type;

    // typeOfStructure (Step 4)
    if (propTypeRaw) data.typeOfStructure = propTypeRaw;

    // ── Zone / Usage ─────────────────────────────────────────────────────────
    const propUseRaw = get(doc, "property.property_use", "");
    if (propUseRaw) {
        const propUseLower = propUseRaw.toLowerCase();
        if (
            propUseLower.includes("residential") ||
            propUseLower.includes("aawasiya") ||
            propUseLower.includes("awasiya") ||
            propUseLower.includes("awas") ||
            propUseLower.includes("rehayshi")
        ) {
            data.zone = "Residential";
            data.usageOfProperty = "Residential";
        } else if (
            propUseLower.includes("commercial") ||
            propUseLower.includes("vanijyik") ||
            propUseLower.includes("vyavsayik") ||
            propUseLower.includes("dukan")
        ) {
            data.zone = "Commercial";
            data.usageOfProperty = "Commercial";
        } else if (
            propUseLower.includes("agricultural") ||
            propUseLower.includes("krishi") ||
            propUseLower.includes("khet") ||
            propUseLower.includes("fasal")
        ) {
            data.zone = "Agricultural";
            data.usageOfProperty = "Agricultural";
        } else {
            data.zone = propUseRaw;
            data.usageOfProperty = propUseRaw;
        }
    } else {
        // Default for open plot
        if (data.unitType === "OPEN PLOT") {
            data.zone = "Residential";
            data.usageOfProperty = "Residential";
        }
    }

    // ownershipType — sensible default
    data.ownershipType = "Freehold";

    // numberAndDate and specific document classifications
    const docTypeRaw = String(doc.document_type || "").toUpperCase();
    const regNum = doc.registration_number || "";
    const regDate = doc.registration_date || "";

    let detailsString = "";
    if (regNum && regDate) {
        detailsString = `${regNum} / ${regDate}`;
    } else if (regNum) {
        detailsString = regNum;
    } else if (regDate) {
        detailsString = regDate;
    }

    if (detailsString) {
        data.numberAndDate = detailsString;
    }

    // Classify document details to fill specific fields in Aditya Birla Form
    if (detailsString) {
        if (
            docTypeRaw.includes("SANCTION") ||
            docTypeRaw.includes("PLAN") ||
            docTypeRaw.includes("BLUEPRINT") ||
            docTypeRaw.includes("MAP")
        ) {
            data.sanctionedPlanDetails = detailsString;
        } else if (
            docTypeRaw.includes("CC") ||
            docTypeRaw.includes("OC") ||
            docTypeRaw.includes("COMPLETION") ||
            docTypeRaw.includes("OCCUPANCY")
        ) {
            data.ccOcDetails = detailsString;
        } else if (
            docTypeRaw.includes("AGREEMENT TO SELL") ||
            docTypeRaw.includes("AGREEMENT TO SALE") ||
            docTypeRaw.includes("ATS") ||
            docTypeRaw.includes("BYANA") ||
            docTypeRaw.includes("BAYANA")
        ) {
            data.agreementToSaleDetails = detailsString;
        } else if (
            docTypeRaw.includes("MUTATION") ||
            docTypeRaw.includes("POSSESSION") ||
            docTypeRaw.includes("NAMANTARAN") ||
            docTypeRaw.includes("DAKHIL") ||
            docTypeRaw.includes("B1") ||
            docTypeRaw.includes("KHASRA") ||
            docTypeRaw.includes("KHATAUNI")
        ) {
            data.mutationPossessionDetails = detailsString;
        } else if (
            docTypeRaw.includes("TAX") ||
            docTypeRaw.includes("RECEIPT") ||
            docTypeRaw.includes("LAGAAN")
        ) {
            data.taxReceiptDetails = detailsString;
        } else if (
            docTypeRaw.includes("ELECTRIC") ||
            docTypeRaw.includes("BILL") ||
            docTypeRaw.includes("BIJLI")
        ) {
            data.electricityBillDetails = detailsString;
        } else if (
            docTypeRaw.includes("CONVERSION") ||
            docTypeRaw.includes("DIVERSION") ||
            docTypeRaw.includes("NA ") ||
            docTypeRaw.includes("N.A.")
        ) {
            data.conversionDetails = detailsString;
        } else {
            // Default/fallback: Sale Deed
            data.saleDeedDetails = detailsString;
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 4 — PropertyDetails (Boundaries, Dimensions, Structural Details)
    // ══════════════════════════════════════════════════════════════════════════
    const bounds = extractedProperty.boundaries || {};

    ["north", "south", "east", "west"].forEach((dir) => {
        const deedVal = bounds[`${dir}_as_per_deed`] || bounds[dir];
        const actualVal = bounds[`${dir}_actual`] || bounds[dir];
        if (deedVal) {
            data[`${dir}Document`] = deedVal;
            data[`${dir}Plan`] = deedVal;
        }
        if (actualVal) {
            data[`${dir}Actual`] = actualVal;
        }
    });

    if (
        bounds.north || bounds.south || bounds.east || bounds.west ||
        bounds.north_as_per_deed || bounds.north_actual
    ) {
        data.boundariesMatching = "Yes";
    }

    // Plot area
    const plotAreaRaw = extractedProperty.LandArea || extractedProperty.plot_area || "";
    if (plotAreaRaw) {
        const numericArea = parseFloat(plotAreaRaw.replace(/[^\d.]/g, "")) || "";
        data.plotArea = numericArea || plotAreaRaw;
        data.landArea = numericArea || plotAreaRaw;
        // Valuation step area fields
        data.landSiteArea = numericArea || plotAreaRaw;
        data.landDocumentArea = numericArea || plotAreaRaw;
        data.landPlanArea = numericArea || plotAreaRaw;
    }

    // Plot dimensions
    const plotDimensions = extractedProperty.plot_dimensions || "";
    if (plotDimensions) {
        data.Dimension = plotDimensions;
        data.linearDimension = plotDimensions;
    }

    // Dimension & Type fields
    if (extractedProperty.dimension_width) data.dimensionWidth = extractedProperty.dimension_width;
    if (extractedProperty.dimension_depth) data.dimensionDepth = extractedProperty.dimension_depth;
    if (extractedProperty.property_sub_type) data.propertySubType = extractedProperty.property_sub_type;

    // ══════════════════════════════════════════════════════════════════════════
    // LATITUDE & LONGITUDE (new)
    // ══════════════════════════════════════════════════════════════════════════
    if (extractedProperty.latitude) {
        data.latitude = extractedProperty.latitude;
    }
    if (extractedProperty.longitude) {
        data.longitude = extractedProperty.longitude;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // NEW EXPANDED FIELDS (Valuation, Setbacks, Engineers, etc.)
    // ══════════════════════════════════════════════════════════════════════════

    // 1. Basic Details
    const basic = extractedProperty.basic_details || {};
    if (basic.valuer_name) data.valuerName = basic.valuer_name;
    if (basic.client_name) {
        data.clientName = basic.client_name;
        if (!data.customerName) data.customerName = basic.client_name;
    }
    if (basic.vertical) data.vertical = basic.vertical;
    if (basic.case_reference_number) {
        data.caseReferenceNumber = basic.case_reference_number;
        if (!data.refNo) data.refNo = basic.case_reference_number;
    }
    if (basic.initiation_date) data.initiationDate = basic.initiation_date;
    if (basic.visit_date) {
        data.visitDate = basic.visit_date;
        if (!data.dateOfReport) data.dateOfReport = basic.visit_date;
    }
    if (basic.report_date) {
        data.reportDate = basic.report_date;
        data.dateOfReport = basic.report_date;
    }

    // 2. Setbacks
    const setbacks = extractedProperty.setbacks || {};
    if (setbacks.front_plan) data.frontAsPerPlan = setbacks.front_plan;
    if (setbacks.front_actual) data.frontActual = setbacks.front_actual;
    if (setbacks.rear_plan) data.rearAsPerPlan = setbacks.rear_plan;
    if (setbacks.rear_actual) data.rearActual = setbacks.rear_actual;
    if (setbacks.side1_plan) data.side1AsPerPlan = setbacks.side1_plan;
    if (setbacks.side1_actual) data.side1Actual = setbacks.side1_actual;
    if (setbacks.side2_plan) data.side2AsPerPlan = setbacks.side2_plan;
    if (setbacks.side2_actual) data.side2Actual = setbacks.side2_actual;

    // 3. Valuation Details
    const val = extractedProperty.valuation_details || {};
    if (val.plot_area_in_deed) data.plotAreaInDeed = val.plot_area_in_deed;
    if (val.plot_area_physical) data.plotAreaPhysical = val.plot_area_physical;
    if (val.built_up_area_norms) data.builtUpAreaNorms = val.built_up_area_norms;
    if (val.built_up_area_tinshed) data.builtUpAreaTinShed = val.built_up_area_tinshed;
    if (val.super_built_up_area) data.superBuiltUpArea = val.super_built_up_area;
    if (val.carpet_area_plan) data.carpetAreaPlan = val.carpet_area_plan;
    if (val.carpet_area_measurement) data.carpetAreaMeasurement = val.carpet_area_measurement;
    if (val.total_value) data.totalValue = val.total_value;
    if (val.distress_value) data.distressValue = val.distress_value;
    if (val.insurance_value) data.insuranceValue = val.insurance_value;
    if (val.government_value) data.governmentValue = val.government_value;
    if (val.completion_percentage) data.completionPercentage = val.completion_percentage;
    if (val.recommendation_percentage) data.recommendationPercentage = val.recommendation_percentage;

    // Rates mapping
    if (val.plot_area_physical_rate) data.plotAreaPhysicalRate = val.plot_area_physical_rate;
    if (val.built_up_area_norms_rate) data.builtUpAreaNormsRate = val.built_up_area_norms_rate;
    if (val.built_up_area_tinshed_rate) data.builtUpTinShedRate = val.built_up_area_tinshed_rate;
    if (val.super_built_up_rate) data.superBuiltUpRate = val.super_built_up_rate;
    if (val.carpet_area_plan_rate) data.carpetAreaPlanRate = val.carpet_area_plan_rate;
    if (val.carpet_area_measurement_rate) data.carpetAreaMeasRate = val.carpet_area_measurement_rate;
    if (val.car_park) data.carPark = val.car_park;
    if (val.car_park_rate) data.carParkRate = val.car_park_rate;
    if (val.amenities_val) data.amenitiesVal = val.amenities_val;
    if (val.amenities_rate) data.amenitiesRate = val.amenities_rate;
    if (val.land_rate) data.landRate = val.land_rate;
    if (val.construction_rate) data.constructionRate = val.construction_rate;

    // 4. Engineer Details
    const eng = extractedProperty.engineer_details || {};
    if (eng.visited_engineer) data.visitedEngineer = eng.visited_engineer;
    if (eng.appraiser_name) data.appraiserName = eng.appraiser_name;
    if (eng.prepared_by) data.preparedBy = eng.prepared_by;
    if (eng.finalized_by) data.finalizedBy = eng.finalized_by;

    // 5. Accommodation Details
    const accom = extractedProperty.accommodation_details || {};
    if (accom.total_floors) data.totalNoOfFloors = accom.total_floors;
    if (accom.property_holding) {
        data.propertyHolding = accom.property_holding;
        data.ownershipType = accom.property_holding;
    }
    if (accom.type_of_structure) data.typeOfStructure = accom.type_of_structure;
    if (accom.age_of_property) data.ageOfProperty = accom.age_of_property;
    if (accom.residual_age) data.residualAge = accom.residual_age;
    if (accom.project_category) data.projectCategory = accom.project_category;
    if (accom.flat_type) data.flatType = accom.flat_type;
    if (accom.flat_configuration) data.flatConfiguration = accom.flat_configuration;
    if (accom.area_of_flat) data.areaOfFlat = accom.area_of_flat;
    if (accom.lift_facility) data.liftFacility = accom.lift_facility;
    if (accom.amenities) data.amenities = accom.amenities;
    if (accom.marketability) data.marketability = accom.marketability;
    if (accom.view_of_property) data.viewOfProperty = accom.view_of_property;
    if (accom.parking_facility) data.parkingFacility = accom.parking_facility;
    if (accom.quality_of_construction) data.qualityOfConstruction = accom.quality_of_construction;
    if (accom.type_of_parking) data.typeOfParking = accom.type_of_parking;
    if (accom.shape_of_property) data.shapeOfProperty = accom.shape_of_property;
    if (accom.placement_of_property) data.placementOfProperty = accom.placement_of_property;
    if (accom.exteriors_of_property) data.exteriorsOfProperty = accom.exteriors_of_property;
    if (accom.interiors_of_property) data.interiorsOfProperty = accom.interiors_of_property;
    if (accom.source_of_age) data.sourceOfAge = accom.source_of_age;
    if (accom.maintenance_of_property) data.maintenanceOfProperty = accom.maintenance_of_property;
    if (accom.cautious_location) data.cautiousLocation = accom.cautious_location;
    if (accom.independent_access) data.independentAccess = accom.independent_access;

    // 6. Location Details
    const loc = extractedProperty.location_details || {};
    if (loc.micro_location) data.microLocation = loc.micro_location;
    if (loc.landmark) data.landmark = loc.landmark;
    if (loc.valuator_done_before) data.valuatorDoneBefore = loc.valuator_done_before;
    if (loc.if_yes_when) data.ifYesWhen = loc.if_yes_when;
    if (loc.locality) data.locality = loc.locality;
    if (loc.property_falling_within) data.propertyFallingWithin = loc.property_falling_within;
    if (loc.occupancy_level) data.occupancyLevel = loc.occupancy_level;
    if (loc.condition_of_site) data.conditionOfSite = loc.condition_of_site;
    if (loc.distance_railway_station) data.distanceRailwayStation = loc.distance_railway_station;
    if (loc.distance_bus_stop) data.distanceBusStop = loc.distance_bus_stop;
    if (loc.distance_plot_main_road) data.distancePlotMainRoad = loc.distance_plot_main_road;
    if (loc.distance_city_centre) data.distanceCityCentre = loc.distance_city_centre;
    if (loc.distance_abcl_branch) data.distanceABCLBranch = loc.distance_abcl_branch;
    if (loc.width_approach_road) data.widthApproachRoad = loc.width_approach_road;
    if (loc.physical_approach) data.physicalApproach = loc.physical_approach;
    if (loc.legal_approach) data.legalApproach = loc.legal_approach;
    if (loc.other_features) data.otherFeatures = loc.other_features;
    if (loc.connectivity) data.connectivity = loc.connectivity;
    if (loc.site_access) data.siteAccess = loc.site_access;
    if (loc.proximity_to_amenities) data.proximityToAmenities = loc.proximity_to_amenities;
    if (loc.comments_on_property) data.commentsOnProperty = loc.comments_on_property;
    if (loc.adverse_factors) data.adverseFactors = loc.adverse_factors;

    // 7. Property Details
    const propDet = extractedProperty.property_details || {};
    if (propDet.occupancy) data.occupancy = propDet.occupancy;
    if (propDet.occupied_by) data.occupiedBy = propDet.occupied_by;
    if (propDet.occupied_since) data.occupiedSince = propDet.occupied_since;
    if (propDet.name_of_occupant) data.nameOfOccupant = propDet.name_of_occupant;
    if (propDet.property_demarcated) data.propertyDemarcated = propDet.property_demarcated;
    if (propDet.property_identification) data.propertyIdentification = propDet.property_identification;
    if (propDet.identification_through) data.identificationThrough = propDet.identification_through;

    // 8. Municipal Details
    const muni = extractedProperty.municipal_details || {};
    if (muni.sanction_plan_provided) data.sanctionPlanProvided = muni.sanction_plan_provided;
    if (muni.date_of_sanction) data.dateOfSanction = muni.date_of_sanction;
    if (muni.sanctioned_area) data.sanctionedArea = muni.sanctioned_area;
    if (muni.municipal_compliance) data.municipalCompliance = muni.municipal_compliance;

    // 9. Built Up Area Details
    const bua = extractedProperty.built_up_area || {};
    if (bua.ground_floor_area) data.groundFloorAsPerSite = bua.ground_floor_area;
    if (bua.first_floor_area) data.firstFloorAsPerSite = bua.first_floor_area;
    if (bua.total_area) data.totalBuiltUp = bua.total_area;
    if (bua.ground_floor_deviation) data.groundFloorDeviation = bua.ground_floor_deviation;
    if (bua.first_floor_deviation) data.firstFloorDeviation = bua.first_floor_deviation;
    if (bua.total_deviation) data.totalDeviation = bua.total_deviation;
    if (bua.ground_floor_deviation_remarks) data.groundFloorDevRmk = bua.ground_floor_deviation_remarks;
    if (bua.first_floor_deviation_remarks) data.firstFloorDevRmk = bua.first_floor_deviation_remarks;
    if (bua.ground_floor_remarks) data.groundFloorRmk = bua.ground_floor_remarks;
    if (bua.first_floor_remarks) data.firstFloorRmk = bua.first_floor_remarks;

    return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const AutoFillForm = ({ setFormData }) => {
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState({});
    const [fileName, setFileName] = useState("");

    const handleUpload = async (files) => {
        if (!files || files.length === 0) {
            message.warning("Please select files to upload.");
            return;
        }

        setLoading(true);
        const form = new FormData();
        files.forEach((file) => form.append("file", file));

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pdf`, {
                method: "POST",
                body: form,
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Upload failed:", errorText);
                message.error("Document processing failed. Please try again.");
                return;
            }

            const response = await res.json();
            console.log("API response:", response);

            if (response.success && response.data) {
                const mapped = mapDocumentToFormData(response.data);
                console.log("Mapped form data:", mapped);
                setFormData(mapped);
                message.success(
                    "Data extract ho gaya! Form fields Hinglish mein auto-fill ho gaye."
                );
            } else {
                message.warning("Response mein valid data nahi mila.");
            }

            if (response.photos) setPhotos(response.photos);

            setFileName(files.map((f) => f.name).join(", "));
        } catch (error) {
            console.error("API call error:", error);
            message.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const clearData = () => {
        setFormData({});
        setPhotos({});
        setFileName("");
        message.info("Auto-fill clear ho gaya");
    };

    return (
        <div style={{ marginBottom: 24 }}>
            {/* <Alert
                message="Auto-fill from Documents"
                description="Property documents upload karein (PDF, images, etc.). AI key information extract karke sabhi form fields mein Hinglish mein auto-fill kar dega."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            /> */}

            <DocumentUpload onUpload={handleUpload} disabled={loading} />

            {loading && (
                <div style={{ marginTop: 16, textAlign: "center" }}>
                    <Spin tip="Documents process ho rahe hain, data extract ho raha hai..." />
                </div>
            )}

            {fileName && !loading && (
                <div
                    style={{
                        marginTop: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span style={{ color: "green" }}>✅ Uploaded: {fileName}</span>
                    <Button type="link" onClick={clearData}>
                        Clear Auto-fill
                    </Button>
                </div>
            )}

            {Object.keys(photos).length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <h3 className="text-lg font-semibold mb-2">Extracted Photos</h3>
                    <PhotoPreview photos={photos} />
                </div>
            )}
        </div>
    );
};

export default AutoFillForm;
