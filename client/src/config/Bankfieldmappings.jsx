const getDimensionParts = (value = "") => {
    const match = String(value)
        .replace(/,/g, " ")
        .match(/([\d.]+)\s*(?:ft|feet|m|mt|meter|meters)?\s*[xX*]\s*([\d.]+)/);

    if (!match) {
        return { width: null, depth: null };
    }

    return {
        width: match[1],
        depth: match[2],
    };
};

export const TRENCH_MAPPING = {
    propertyAddress: ["addressSite", "addressLegal", "propertyName"],
    dateOfReport: "dateOfReport",
    visitedPersonName: "customerName",
    latitude: "latitude",
    longitude: "longitude",
    dateOfVisit: "dateOfReport",
    contactNumber: "contactNumber",
    LandArea: ["property.LandArea", "landArea"],
};

export const ADITYA_MAPPING = {
    "basicDetails.nameOfValuer": "valuerName",
    "basicDetails.nameOfClient": ["clientName", "customerName"],
    "basicDetails.nameOfPropertyOwner": "propertyOwnerName",
    "basicDetails.caseReferenceNumber": ["caseReferenceNumber", "refNo"],
    "basicDetails.vertical": "vertical",
    "basicDetails.initiationDate": ["initiationDate", "dateOfReport"],
    "basicDetails.visitDate": ["visitDate", "dateOfReport"],
    "basicDetails.reportDate": ["reportDate", "dateOfReport"],
    "locationDetails.propertyAddressAsTRF": [
        "addressLegal",
        "addressSite",
        "propertyName",
    ],
    "locationDetails.propertyAddressAsVisit": [
        "addressSite",
        "addressLegal",
        "propertyName",
    ],
    "locationDetails.propertyAddressAsDocs": [
        "addressLegal",
        "addressSite",
        "propertyName",
    ],
    "locationDetails.mainLocality": ["mainLocality", "city"],
    "locationDetails.subLocality": ["subLocality", "colonyArea", "villageName", "city"],
    "locationDetails.latitude": "latitude",
    "locationDetails.longitude": "longitude",
    "locationDetails.typeOfProperty": ["usageOfProperty", "zone"],
    "locationDetails.currentUsage": "usageOfProperty",
    "locationDetails.propertyType": ["usageOfProperty", "zone"],
    "locationDetails.propertySubType": ["propertySubType", "unitType"],
    "locationDetails.dimensionWidth": (data) =>
        data.dimensionWidth || getDimensionParts(data.linearDimension).width,
    "locationDetails.dimensionDepth": (data) =>
        data.dimensionDepth || getDimensionParts(data.linearDimension).depth,
    "locationDetails.microLocation": "microLocation",
    "locationDetails.landmark": "landmark",
    "locationDetails.valuatorDoneBefore": "valuatorDoneBefore",
    "locationDetails.ifYesWhen": "ifYesWhen",
    "locationDetails.locality": "locality",
    "locationDetails.propertyFallingWithin": "propertyFallingWithin",
    "locationDetails.occupancyLevel": "occupancyLevel",
    "locationDetails.conditionOfSite": "conditionOfSite",
    "locationDetails.distanceRailwayStation": "distanceRailwayStation",
    "locationDetails.distanceBusStop": "distanceBusStop",
    "locationDetails.distancePlotMainRoad": "distancePlotMainRoad",
    "locationDetails.distanceCityCentre": "distanceCityCentre",
    "locationDetails.distanceABCLBranch": "distanceABCLBranch",
    "locationDetails.widthApproachRoad": "widthApproachRoad",
    "locationDetails.physicalApproach": "physicalApproach",
    "locationDetails.legalApproach": "legalApproach",
    "locationDetails.otherFeatures": "otherFeatures",
    "documentDetails.saleDeedDetails": (data) => {
        const isSaleDeed = !data.document_type || ["SALE", "DEED", "OWNERSHIP", "ALLOTMENT", "CONVEYANCE", "REGISTRY", "RESTRY", "LEASE", "GIFT", "PARTITION"].some(t => String(data.document_type).toUpperCase().includes(t));
        if (isSaleDeed) {
            return data.saleDeedDetails || data.numberAndDate || data.documentsAvailable;
        }
        return null;
    },
    "documentDetails.sanctionedPlanDetails": "sanctionedPlanDetails",
    "documentDetails.ccOcDetails": "ccOcDetails",
    "documentDetails.agreementToSaleDetails": "agreementToSaleDetails",
    "documentDetails.mutationPossessionDetails": "mutationPossessionDetails",
    "documentDetails.taxReceiptDetails": "taxReceiptDetails",
    "documentDetails.electricityBillDetails": "electricityBillDetails",
    "documentDetails.conversionDetails": "conversionDetails",
    "propertyDetails.occupancy": "occupancy",
    "propertyDetails.occupiedBy": "occupiedBy",
    "propertyDetails.occupiedSince": "occupiedSince",
    "propertyDetails.nameOfOccupant": ["nameOfOccupant", "personMetDuringVisit", "customerName"],
    "propertyDetails.propertyDemarcated": "propertyDemarcated",
    "propertyDetails.propertyIdentification": "propertyIdentification",
    "propertyDetails.identificationThrough": "identificationThrough",
    "boundaryDetails.northAsPerDocs": "northDocument",
    "boundaryDetails.southAsPerDocs": "southDocument",
    "boundaryDetails.eastAsPerDocs": "eastDocument",
    "boundaryDetails.westAsPerDocs": "westDocument",
    "boundaryDetails.northActual": "northActual",
    "boundaryDetails.southActual": "southActual",
    "boundaryDetails.eastActual": "eastActual",
    "boundaryDetails.westActual": "westActual",
    "boundaryDetails.boundaryMatching": (data) =>
        data.boundariesMatching || "YES",

    // Accommodation details
    "accommodationDetails.typeOfStructure": ["typeOfStructure", "type_of_structure"],
    "accommodationDetails.propertyHolding": ["propertyHolding", "ownershipType"],
    "accommodationDetails.totalNoOfFloors": "totalNoOfFloors",
    "accommodationDetails.ageOfProperty": "ageOfProperty",
    "accommodationDetails.residualAge": "residualAge",
    "accommodationDetails.projectCategory": "projectCategory",
    "accommodationDetails.flatType": "flatType",
    "accommodationDetails.flatConfiguration": "flatConfiguration",
    "accommodationDetails.areaOfFlat": "areaOfFlat",
    "accommodationDetails.liftFacility": "liftFacility",
    "accommodationDetails.amenities": "amenities",
    "accommodationDetails.marketability": "marketability",
    "accommodationDetails.viewOfProperty": "viewOfProperty",
    "accommodationDetails.parkingFacility": "parkingFacility",
    "accommodationDetails.qualityOfConstruction": "qualityOfConstruction",
    "accommodationDetails.typeOfParking": "typeOfParking",
    "accommodationDetails.shapeOfProperty": "shapeOfProperty",
    "accommodationDetails.placementOfProperty": "placementOfProperty",
    "accommodationDetails.exteriorsOfProperty": "exteriorsOfProperty",
    "accommodationDetails.interiorsOfProperty": "interiorsOfProperty",
    "accommodationDetails.sourceOfAge": "sourceOfAge",
    "accommodationDetails.maintenanceOfProperty": "maintenanceOfProperty",
    "accommodationDetails.cautiousLocation": "cautiousLocation",

    // Valuation details
    "valuationDetails.plotAreaInDeed": ["plotAreaInDeed", "plotArea", "landArea"],
    "valuationDetails.plotAreaPhysical": ["plotAreaPhysical", "plotArea", "landArea"],
    "valuationDetails.plotAreaPhysicalRate": "plotAreaPhysicalRate",
    "valuationDetails.builtUpAreaNorms": ["builtUpAreaNorms", "plotArea", "landArea"],
    "valuationDetails.builtUpAreaNormsRate": "builtUpAreaNormsRate",
    "valuationDetails.builtUpAreaTinShed": ["builtUpAreaTinShed", "plotArea", "landArea"],
    "valuationDetails.builtUpTinShedRate": "builtUpTinShedRate",
    "valuationDetails.superBuiltUpArea": "superBuiltUpArea",
    "valuationDetails.superBuiltUpRate": "superBuiltUpRate",
    "valuationDetails.carpetAreaPlan": "carpetAreaPlan",
    "valuationDetails.carpetAreaPlanRate": "carpetAreaPlanRate",
    "valuationDetails.carpetAreaMeasurement": "carpetAreaMeasurement",
    "valuationDetails.carpetAreaMeasRate": "carpetAreaMeasRate",
    "valuationDetails.carPark": "carPark",
    "valuationDetails.carParkRate": "carParkRate",
    "valuationDetails.amenitiesVal": "amenitiesVal",
    "valuationDetails.amenitiesRate": "amenitiesRate",
    "valuationDetails.totalValue": "totalValue",
    "valuationDetails.distressValue80": ["distressValue", "totalValue"],
    "valuationDetails.insuranceValue": "insuranceValue",
    "valuationDetails.governmentValue": "governmentValue",
    "valuationDetails.percentageCompletion": "completionPercentage",
    "valuationDetails.percentageRecommendation": "recommendationPercentage",

    // Setbacks
    "setbacks.frontAsPerPlan": "frontAsPerPlan",
    "setbacks.frontActual": "frontActual",
    "setbacks.rearAsPerPlan": "rearAsPerPlan",
    "setbacks.rearActual": "rearActual",
    "setbacks.side1AsPerPlan": "side1AsPerPlan",
    "setbacks.side1Actual": "side1Actual",
    "setbacks.side2AsPerPlan": "side2AsPerPlan",
    "setbacks.side2Actual": "side2Actual",

    // Built Up Area
    "builtUpArea.groundFloorAsPerSite": "groundFloorAsPerSite",
    "builtUpArea.groundFloorDeviation": "groundFloorDeviation",
    "builtUpArea.groundFloorDevRmk": "groundFloorDevRmk",
    "builtUpArea.groundFloorRmk": "groundFloorRmk",
    "builtUpArea.firstFloorAsPerSite": "firstFloorAsPerSite",
    "builtUpArea.firstFloorDeviation": "firstFloorDeviation",
    "builtUpArea.firstFloorDevRmk": "firstFloorDevRmk",
    "builtUpArea.firstFloorRmk": "firstFloorRmk",
    "builtUpArea.totalBuiltUp": "totalBuiltUp",
    "builtUpArea.totalDeviation": "totalDeviation",

    // Engineer details
    "engineerDetails.nameOfEngineerVisited": "visitedEngineer",
    "engineerDetails.nameOfAppraiser": "appraiserName",
    "engineerDetails.reportPreparedBy": "preparedBy",
    "engineerDetails.reportFinalizedBy": "finalizedBy",
};

export const MANAPPURAM_MAPPING = {
    "header.valueName": "valuerName",
    "header.caseRefNo": ["caseReferenceNumber", "refNo"],
    "header.dateOfVisit": ["visitDate", "dateOfReport"],
    "header.dateOfReport": ["reportDate", "dateOfReport"],
    "header.contactedPerson": (data) =>
        [data.personMetDuringVisit || data.customerName || data.clientName, data.contactNumber || data.customerNo]
            .filter(Boolean)
            .join(" / "),
    "propertyInfo.applicantName": ["customerName", "clientName"],
    "propertyInfo.ownerName": ["propertyOwnerName", "ownerName"],
    "propertyInfo.documentProduced": ["documentsAvailable", "document_type"],
    "propertyInfo.typeOfProperty": ["typeOfStructure", "usageOfProperty", "unitType"],
    "propertyInfo.currentUsage": "usageOfProperty",
    "propertyInfo.holdingType": ["propertyHolding", "ownershipType"],
    "propertyInfo.propertyUsage": "usageOfProperty",
    "propertyInfo.measurementOfProperty": ["linearDimension", "landArea", "plotArea"],
    "propertyInfo.addressAtSite": [
        "addressSite",
        "addressLegal",
        "propertyName",
    ],
    "propertyInfo.addressAsPerDocument": [
        "addressLegal",
        "addressSite",
        "propertyName",
    ],
    "propertyInfo.landmark": ["landmark", "propertyName"],
    "propertyInfo.locationOfProperty": (data) => {
        const fallingWithin = String(data.propertyFallingWithin || "").toLowerCase();
        const micro = String(data.microLocation || "").toLowerCase();
        const loc = String(data.locality || "").toLowerCase();
        if (fallingWithin.includes("panchayat") || micro.includes("rural") || loc.includes("rural")) {
            return "RURAL";
        }
        if (fallingWithin.includes("corporation") || micro.includes("metro") || loc.includes("metro")) {
            return "METROPOLITAN";
        }
        if (fallingWithin.includes("municipality") || fallingWithin.includes("municipal council") || micro.includes("urban") || loc.includes("urban")) {
            return "URBAN";
        }
        if (fallingWithin.includes("town") || fallingWithin.includes("tp") || micro.includes("semi") || loc.includes("semi")) {
            return "SEMI URBAN";
        }
        return "RURAL";
    },
    "propertyInfo.distanceFromBranch": ["distanceABCLBranch", "distanceCityCentre", "distanceRailwayStation", "distanceBusStop"],
    "propertyInfo.usageAuthorized": ["usageOfProperty", "zone"],
    "propertyInfo.usageRestriction": (data) => data.adverseFactors || "No",
    "propertyInfo.occupancyStatus": ["occupancy", "occupancyStatus"],
    "siteBoundaries.northDoc": "northDocument",
    "siteBoundaries.southDoc": "southDocument",
    "siteBoundaries.eastDoc": "eastDocument",
    "siteBoundaries.westDoc": "westDocument",
    "siteBoundaries.northActual": "northActual",
    "siteBoundaries.southActual": "southActual",
    "siteBoundaries.eastActual": "eastActual",
    "siteBoundaries.westActual": "westActual",
    "siteBoundaries.boundariesTallied": (data) =>
        data.boundariesMatching ? "YES" : "NO",
    "accessibility.connectivity": "connectivity",
    "accessibility.siteAccess": (data) => {
        const val = String(data.siteAccess || data.physicalApproach || "").toLowerCase();
        if (val.includes("clear") || val.includes("well") || val.includes("good") || val.includes("dev")) {
            if (val.includes("partially") || val.includes("under")) return "UNDER DEV";
            return "WELL DEV";
        }
        if (val.includes("no") || val.includes("not") || val.includes("bad")) {
            return "NO ACCESS";
        }
        return "WELL DEV";
    },
    "accessibility.typeWidthOfRoad": "widthApproachRoad",
    "accessibility.withinMunicipalLimits": "propertyFallingWithin",
    "accessibility.proximityToAmenities": "proximityToAmenities",
    "accessibility.commentsOnProperty": "commentsOnProperty",
    "accessibility.adverseFactors": "adverseFactors",
    "municipalDetails.currentAgeProperty": "ageOfProperty",
    "municipalDetails.estimatedResidualAge": "residualAge",
    "municipalDetails.sanctionPlanProvided": "sanctionPlanProvided",
    "municipalDetails.dateOfSanction": "dateOfSanction",
    "municipalDetails.sanctionedArea": "sanctionedArea",
    "municipalDetails.municipalCompliance": "municipalCompliance",
    "technicalDetails.constructionType": "typeOfStructure",
    "technicalDetails.noOfFloors": "totalNoOfFloors",
    "technicalDetails.totalLandArea": ["plotAreaPhysical", "plotAreaInDeed", "plotArea", "landArea"],
    "technicalDetails.totalBuiltUpArea": ["builtUpAreaNorms", "superBuiltUpArea"],
    "technicalDetails.totalFloorArea": ["totalBuiltUp", "builtUpAreaNorms", "superBuiltUpArea"],
    "technicalDetails.percentCompletion": "completionPercentage",
    "technicalDetails.currentAge": "ageOfProperty",
    "technicalDetails.estimatedResidualAge": "residualAge",
    "technicalDetails.independentAccess": "independentAccess",
    "valuationGLR.landArea": ["plotAreaInDeed", "plotArea", "landArea"],
    "valuationGLR.landRate": "landRate",
    "valuationPMR.landArea": ["plotAreaPhysical", "plotArea", "landArea"],
    "valuationPMR.landRate": "landRate",
    "valuationPMR.constructionArea": ["builtUpAreaNorms", "superBuiltUpArea"],
    "valuationPMR.constructionRate": "constructionRate",
    "valuationPMR.totalValue": "totalValue",
    "distressValue": ["distressValue", "forcedSaleValue"],
    "summary.propertyAddress": [
        "addressLegal",
        "addressSite",
        "propertyName",
    ],
    "summary.propertyType": ["unitType", "usageOfProperty"],
    "summary.applicantName": ["customerName", "clientName"],
    "summary.presentMarketValue": "totalValue",
    "summary.forcedSaleValue": ["distressValue", "forcedSaleValue"],
    "summary.coordinates": (data) =>
        data.latitude && data.longitude
            ? `${data.latitude}, ${data.longitude}`
            : null,
};
