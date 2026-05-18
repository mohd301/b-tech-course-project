import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Alert,
    Badge,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardText,
    CardTitle,
    Col,
    Container,
    FormGroup,
    Input,
    Label,
    ListGroup,
    ListGroupItem,
    Row
} from "reactstrap";
import { FaCopy, FaDownload, FaPlus, FaRotateLeft, FaTrash } from "react-icons/fa6";
import { useTheme } from "../compsMisc/ThemeContext";

const API_PORT = process.env.REACT_APP_PORT || "7500";

const conditionFieldOptions = [
    "Age",
    "Salary",
    "Marital_Status",
    "Employment_Status",
    "Governorate",
    "Household_Size",
    "Degree_Level",
    "Primary_Income_Source",
    "Has_Other_Social_Benefits",
    "Assets_Value",
    "Liabilities_Value",
    "Previous_Subsidy_Received",
    "Applications_Last_12_Months",
    "Late_or_Missed_Renewals",
    "Number_of_Children",
    "Working_Children_Count",
    "Total_Spouse_Income",
    "Total_Children_Income",
    "Total_Household_Income",
    "Vehicle_Ownership",
    "Vehicle_Count",
    "Cylinder_Count",
    "Vehicle_Age_Years",
    "Fuel_Type",
    "Average_Fuel_Consumption_L",
    "Expected_Fuel_Consumption_L",
    "Fuel_Deviation_L",
    "Fuel_Deviation_Ratio"
];

const operatorOptions = ["==", "!=", ">", ">=", "<", "<=", "in", "between"];

const commonSectionKeys = [
    "Age",
    "Gender",
    "Marital_Status",
    "Governorate",
    "Household_Size",
    "Salary",
    "Degree_Level",
    "Employment_Status",
    "Primary_Income_Source",
    "Has_Other_Social_Benefits",
    "Assets_Value",
    "Liabilities_Value",
    "Number_of_Children",
    "Total_Spouse_Income",
    "Total_Children_Income",
    "Previous_Subsidy_Received",
    "Late_or_Missed_Renewals",
    "Applications_Last_12_Months",
    "ID"
];

const derivedSectionKeys = [
    "Working_Children_Count",
    "Total_Household_Income",
    "Vehicle_Ownership",
    "Vehicle_Count",
    "Cylinder_Count",
    "Vehicle_Age_Years",
    "Fuel_Type",
    "Expected_Fuel_Consumption_L",
    "Average_Fuel_Consumption_L",
    "Fuel_Deviation_L",
    "Fuel_Deviation_Ratio"
];

function createRule() {
    return {
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        col: "Salary",
        op: "<=",
        val: "600"
    };
}

function createGroup() {
    return {
        id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        rules: [createRule()]
    };
}

function getInitialState() {
    return {
        basics: {
            n_eligible: "500",
            n_ineligible: "300",
            fraud_fraction: "0.1"
        },
        sections: {
            Age: false,
            Gender: false,
            Marital_Status: false,
            Household_Size: false,
            Governorate: false,
            Salary: false,
            Degree_Level: false,
            Employment_Status: false,
            Primary_Income_Source: false,
            Has_Other_Social_Benefits: false,
            Assets_Value: false,
            Liabilities_Value: false,
            Number_of_Children: false,
            Working_Children_Count: false,
            Total_Spouse_Income: false,
            Total_Children_Income: false,
            Total_Household_Income: false,
            Vehicle_Ownership: false,
            Vehicle_Count: false,
            Cylinder_Count: false,
            Vehicle_Age_Years: false,
            Fuel_Type: false,
            Expected_Fuel_Consumption_L: false,
            Average_Fuel_Consumption_L: false,
            Fuel_Deviation_L: false,
            Fuel_Deviation_Ratio: false,
            Previous_Subsidy_Received: false,
            Late_or_Missed_Renewals: false,
            Applications_Last_12_Months: false,
            ID: false,
            Conditions: false,
            fraudmulti: false
        },
        age: {
            Center: "35",
            Scale: "12",
            minAge: "18",
            maxAge: "70"
        },
        gender: {
            pValue: "0.55, 0.45"
        },
        marital: {
            pValue: "0.4, 0.5, 0.07, 0.03"
        },
        governorate: {
            City: "Muscat, Dhofar, Sohar, Nizwa, Sur",
            PvalueSize: "0.35, 0.15, 0.2, 0.15, 0.15"
        },
        householdSize: {
            lam: "4",
            MinHsize: "1",
            MaxHsize: "9"
        },
        salary: {
            eloc: "90",
            escale: "45",
            inloc: "1100",
            inscale: "300",
            minSalary: "80"
        },
        degreeLevel: {
            pvalue: "0.1, 0.35, 0.2, 0.3, 0.05"
        },
        employment: {
            pvalue: "0.6, 0.15, 0.15, 0.1"
        },
        primaryIncomeSource: {
            pvalue: "0.45, 0.3, 0.2, 0.05"
        },
        otherBenefits: {
            pvalue: "0.7, 0.3"
        },
        assetsValue: {
            eligible_mean: "3000",
            eligible_sigma: "0.5",
            ineligible_mean: "12000",
            ineligible_sigma: "0.6"
        },
        liabilitiesValue: {
            mean: "2000",
            sigma: "0.7"
        },
        numberOfChildren: {
            lam: "2",
            max: "7"
        },
        spouseIncome: {
            mean: "250",
            sigma: "0.45",
            max: "2000"
        },
        childrenIncome: {
            mean: "90",
            sigma: "0.5"
        },
        previousSubsidy: {
            pvalue: "0.3, 0.7",
            amount_mean: "25",
            amount_std: "8",
            amount_min: "5",
            amount_max: "60"
        },
        lateRenewals: {
            lam: "0.3"
        },
        applicationsLast12Months: {
            lam: "1.0"
        },
        fraudProfile: {
            fraud_fraction: "0.1",
            fuel_multiplier: "2.5",
            apps_boost: "3",
            renewals_boost: "2"
        },
        // ── NEW STATE FIELDS ──────────────────────────────────
        workingChildrenCount: {
            p_young: "0.1",
            p_old: "0.3"
        },
        vehicleOwnership: {
            pvalue: "0.2, 0.8"
        },
        vehicleCount: {
            lam: "1.5"
        },
        cylinderCount: {
            options: "4, 6, 8",
            pvalue: "0.5, 0.35, 0.15"
        },
        vehicleAge: {
            lam: "7",
            min: "0",
            max: "20"
        },
        fuelType: {
            options: "Petrol, Diesel",
            pvalue: "0.7, 0.3"
        },
        expectedFuelConsumption: {
            cyl4: "100",
            cyl6: "130",
            cyl8: "160"
        },
        averageFuelConsumption: {
            noise_mean: "0",
            noise_std: "30"
        },
        // ─────────────────────────────────────────────────────
        conditionGroups: [createGroup()],
    };
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseRequiredNumber(value, label, errors, options = {}) {
    const { integer = false, min = null, max = null, allowZero = true } = options;
    if (value === "") {
        errors.push(`${label} is required.`);
        return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        errors.push(`${label} must be a number.`);
        return null;
    }

    if (integer && !Number.isInteger(parsed)) {
        errors.push(`${label} must be a whole number.`);
        return null;
    }

    if (!allowZero && parsed === 0) {
        errors.push(`${label} must be greater than 0.`);
        return null;
    }

    if (min !== null && parsed < min) {
        errors.push(`${label} must be at least ${min}.`);
        return null;
    }

    if (max !== null && parsed > max) {
        errors.push(`${label} must be at most ${max}.`);
        return null;
    }

    return parsed;
}

function parseProbabilityList(rawValue, label, expectedLength, errors) {
    const values = rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value));

    if (values.length !== expectedLength || values.some((value) => Number.isNaN(value))) {
        errors.push(`${label} must contain exactly ${expectedLength} numeric values.`);
        return null;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 1) > 0.001) {
        errors.push(`${label} must add up to 1.`);
        return null;
    }

    return values;
}

function parseStringList(rawValue, label, errors) {
    const values = rawValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

    if (!values.length) {
        errors.push(`${label} must include at least one value.`);
        return null;
    }

    return values;
}

function parseScalarValue(rawValue) {
    const value = rawValue.trim();

    if (value === "") {
        return "";
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    if (!Number.isNaN(Number(value)) && value !== "") {
        return Number(value);
    }

    if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

function parseRuleValue(operator, rawValue) {
    if (operator === "in" || operator === "between") {
        const trimmed = rawValue.trim();
        if (!trimmed) {
            throw new Error("Value is required.");
        }

        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            const parsed = JSON.parse(trimmed);
            if (!Array.isArray(parsed)) {
                throw new Error("Value must be an array.");
            }
            return parsed;
        }

        return trimmed
            .split(",")
            .map((value) => parseScalarValue(value))
            .filter((value) => value !== "");
    }

    return parseScalarValue(rawValue);
}

function normalizeLegacyPayload(payload) {
    return {
        ...payload,
        fruad_fraction: payload.fraud_fraction
    };
}

function serializeRequest(state) {
    const errors = [];
    const payload = {};

    const nEligible = parseRequiredNumber(
        state.basics.n_eligible,
        "Eligible record count",
        errors,
        { integer: true, min: 1, allowZero: false }
    );
    const nIneligible = parseRequiredNumber(
        state.basics.n_ineligible,
        "Ineligible record count",
        errors,
        { integer: true, min: 1, allowZero: false }
    );
    const fraudFraction = parseRequiredNumber(
        state.basics.fraud_fraction,
        "Top-level fraud fraction",
        errors,
        { min: 0.000001, max: 0.999999, allowZero: false }
    );

    if (nEligible !== null) payload.n_eligible = nEligible;
    if (nIneligible !== null) payload.n_ineligible = nIneligible;
    if (fraudFraction !== null) payload.fraud_fraction = fraudFraction;

    if (state.sections.Age) {
        const center = parseRequiredNumber(state.age.Center, "Age center", errors);
        const scale = parseRequiredNumber(state.age.Scale, "Age scale", errors, { min: 0 });
        const minAge = parseRequiredNumber(state.age.minAge, "Minimum age", errors, { integer: true, min: 0 });
        const maxAge = parseRequiredNumber(state.age.maxAge, "Maximum age", errors, { integer: true, min: 0 });

        if (minAge !== null && maxAge !== null && minAge > maxAge) {
            errors.push("Minimum age must be less than or equal to maximum age.");
        }

        if ([center, scale, minAge, maxAge].every((v) => v !== null)) {
            payload.Age = { Center: center, Scale: scale, minAge, maxAge };
        }
    }

    if (state.sections.Gender) {
        const pValue = parseProbabilityList(state.gender.pValue, "Gender probabilities", 2, errors);
        if (pValue) payload.Gender = { pValue };
    }

    if (state.sections.Marital_Status) {
        const pValue = parseProbabilityList(state.marital.pValue, "Marital status probabilities", 4, errors);
        if (pValue) payload.Marital_Status = { pValue };
    }

    if (state.sections.Governorate) {
        const cities = parseStringList(state.governorate.City, "Governorate cities", errors);
        const probabilities = parseProbabilityList(
            state.governorate.PvalueSize,
            "Governorate probabilities",
            cities ? cities.length : 0,
            errors
        );
        if (cities && probabilities) {
            payload.Governorate = { City: cities, PvalueSize: probabilities };
        }
    }

    if (state.sections.Household_Size) {
        const lam = parseRequiredNumber(state.householdSize.lam, "Household size lambda", errors, { min: 0 });
        const minHouseholdSize = parseRequiredNumber(state.householdSize.MinHsize, "Minimum household size", errors, { integer: true, min: 0 });
        const maxHouseholdSize = parseRequiredNumber(state.householdSize.MaxHsize, "Maximum household size", errors, { integer: true, min: 0 });

        if (minHouseholdSize !== null && maxHouseholdSize !== null && minHouseholdSize > maxHouseholdSize) {
            errors.push("Minimum household size must be less than or equal to maximum household size.");
        }

        if ([lam, minHouseholdSize, maxHouseholdSize].every((v) => v !== null)) {
            payload.Household_Size = { lam, MinHsize: minHouseholdSize, MaxHsize: maxHouseholdSize };
        }
    }

    if (state.sections.Salary) {
        const eloc = parseRequiredNumber(state.salary.eloc, "Eligible salary mean", errors);
        const escale = parseRequiredNumber(state.salary.escale, "Eligible salary scale", errors, { min: 0 });
        const inloc = parseRequiredNumber(state.salary.inloc, "Ineligible salary mean", errors);
        const inscale = parseRequiredNumber(state.salary.inscale, "Ineligible salary scale", errors, { min: 0 });
        const minSalary = parseRequiredNumber(state.salary.minSalary, "Minimum salary", errors, { min: 0 });

        if ([eloc, escale, inloc, inscale, minSalary].every((v) => v !== null)) {
            payload.Salary = { eloc, escale, inloc, inscale, minSalary };
        }
    }

    if (state.sections.Degree_Level) {
        const pvalue = parseProbabilityList(state.degreeLevel.pvalue, "Degree level probabilities", 5, errors);
        if (pvalue) payload.Degree_Level = { pvalue };
    }

    if (state.sections.Employment_Status) {
        const pvalue = parseProbabilityList(state.employment.pvalue, "Employment status probabilities", 4, errors);
        if (pvalue) payload.Employment_Status = { pvalue };
    }

    if (state.sections.Primary_Income_Source) {
        const pvalue = parseProbabilityList(state.primaryIncomeSource.pvalue, "Primary income source probabilities", 4, errors);
        if (pvalue) payload.Primary_Income_Source = { pvalue };
    }

    if (state.sections.Has_Other_Social_Benefits) {
        const pvalue = parseProbabilityList(state.otherBenefits.pvalue, "Other social benefits probabilities", 2, errors);
        if (pvalue) payload.Has_Other_Social_Benefits = { pvalue };
    }

    if (state.sections.Assets_Value) {
        const eligibleMean = parseRequiredNumber(state.assetsValue.eligible_mean, "Eligible assets mean", errors, { min: 0.000001, allowZero: false });
        const eligibleSigma = parseRequiredNumber(state.assetsValue.eligible_sigma, "Eligible assets sigma", errors, { min: 0 });
        const ineligibleMean = parseRequiredNumber(state.assetsValue.ineligible_mean, "Ineligible assets mean", errors, { min: 0.000001, allowZero: false });
        const ineligibleSigma = parseRequiredNumber(state.assetsValue.ineligible_sigma, "Ineligible assets sigma", errors, { min: 0 });

        if ([eligibleMean, eligibleSigma, ineligibleMean, ineligibleSigma].every((v) => v !== null)) {
            payload.Assets_Value = {
                eligible_mean: eligibleMean,
                eligible_sigma: eligibleSigma,
                ineligible_mean: ineligibleMean,
                ineligible_sigma: ineligibleSigma
            };
        }
    }

    if (state.sections.Liabilities_Value) {
        const mean = parseRequiredNumber(state.liabilitiesValue.mean, "Liabilities mean", errors, { min: 0.000001, allowZero: false });
        const sigma = parseRequiredNumber(state.liabilitiesValue.sigma, "Liabilities sigma", errors, { min: 0 });
        if ([mean, sigma].every((v) => v !== null)) {
            payload.Liabilities_Value = { mean, sigma };
        }
    }

    if (state.sections.Number_of_Children) {
        const lam = parseRequiredNumber(state.numberOfChildren.lam, "Children lambda", errors, { min: 0 });
        const max = parseRequiredNumber(state.numberOfChildren.max, "Maximum children count", errors, { integer: true, min: 0 });
        if ([lam, max].every((v) => v !== null)) {
            payload.Number_of_Children = { lam, max };
        }
    }

    // ── UPDATED: Working_Children_Count ──────────────────────
    if (state.sections.Working_Children_Count) {
        const pYoung = parseRequiredNumber(state.workingChildrenCount.p_young, "Working children p_young", errors, { min: 0, max: 1 });
        const pOld   = parseRequiredNumber(state.workingChildrenCount.p_old,   "Working children p_old",   errors, { min: 0, max: 1 });
        if ([pYoung, pOld].every((v) => v !== null)) {
            payload.Working_Children_Count = { p_young: pYoung, p_old: pOld };
        }
    }

    if (state.sections.Total_Spouse_Income) {
        const mean = parseRequiredNumber(state.spouseIncome.mean, "Spouse income mean", errors, { min: 0.000001, allowZero: false });
        const sigma = parseRequiredNumber(state.spouseIncome.sigma, "Spouse income sigma", errors, { min: 0 });
        const max = parseRequiredNumber(state.spouseIncome.max, "Spouse income maximum", errors, { min: 0 });
        if ([mean, sigma, max].every((v) => v !== null)) {
            payload.Total_Spouse_Income = { mean, sigma, max };
        }
    }

    if (state.sections.Total_Children_Income) {
        const mean = parseRequiredNumber(state.childrenIncome.mean, "Children income mean", errors, { min: 0.000001, allowZero: false });
        const sigma = parseRequiredNumber(state.childrenIncome.sigma, "Children income sigma", errors, { min: 0 });
        if ([mean, sigma].every((v) => v !== null)) {
            payload.Total_Children_Income = { mean, sigma };
        }
    }

    if (state.sections.Total_Household_Income) {
        payload.Total_Household_Income = true;
    }

    // ── UPDATED: Vehicle_Ownership ───────────────────────────
    if (state.sections.Vehicle_Ownership) {
        const pvalue = parseProbabilityList(state.vehicleOwnership.pvalue, "Vehicle ownership probabilities", 2, errors);
        if (pvalue) payload.Vehicle_Ownership = { pvalue };
    }

    // ── UPDATED: Vehicle_Count ───────────────────────────────
    if (state.sections.Vehicle_Count) {
        const lam = parseRequiredNumber(state.vehicleCount.lam, "Vehicle count lambda", errors, { min: 0 });
        if (lam !== null) payload.Vehicle_Count = { lam };
    }

    // ── UPDATED: Cylinder_Count ──────────────────────────────
    if (state.sections.Cylinder_Count) {
        const options = parseStringList(state.cylinderCount.options, "Cylinder count options", errors)
            ?.map((v) => Number(v))
            .filter((v) => !Number.isNaN(v));
        const pvalue = options
            ? parseProbabilityList(state.cylinderCount.pvalue, "Cylinder count probabilities", options.length, errors)
            : null;
        if (options && pvalue) payload.Cylinder_Count = { options, pvalue };
    }

    // ── UPDATED: Vehicle_Age_Years ───────────────────────────
    if (state.sections.Vehicle_Age_Years) {
        const lam = parseRequiredNumber(state.vehicleAge.lam, "Vehicle age lambda", errors, { min: 0 });
        const min = parseRequiredNumber(state.vehicleAge.min, "Vehicle age minimum", errors, { integer: true, min: 0 });
        const max = parseRequiredNumber(state.vehicleAge.max, "Vehicle age maximum", errors, { integer: true, min: 0 });
        if (min !== null && max !== null && min > max) {
            errors.push("Vehicle age minimum must be less than or equal to maximum.");
        }
        if ([lam, min, max].every((v) => v !== null)) {
            payload.Vehicle_Age_Years = { lam, min, max };
        }
    }

    // ── UPDATED: Fuel_Type ───────────────────────────────────
    if (state.sections.Fuel_Type) {
        const options = parseStringList(state.fuelType.options, "Fuel type options", errors);
        const pvalue = options
            ? parseProbabilityList(state.fuelType.pvalue, "Fuel type probabilities", options.length, errors)
            : null;
        if (options && pvalue) payload.Fuel_Type = { options, pvalue };
    }

    // ── UPDATED: Expected_Fuel_Consumption_L ─────────────────
    if (state.sections.Expected_Fuel_Consumption_L) {
        const cyl4 = parseRequiredNumber(state.expectedFuelConsumption.cyl4, "Expected fuel (4-cyl)", errors, { min: 0 });
        const cyl6 = parseRequiredNumber(state.expectedFuelConsumption.cyl6, "Expected fuel (6-cyl)", errors, { min: 0 });
        const cyl8 = parseRequiredNumber(state.expectedFuelConsumption.cyl8, "Expected fuel (8-cyl)", errors, { min: 0 });
        if ([cyl4, cyl6, cyl8].every((v) => v !== null)) {
            payload.Expected_Fuel_Consumption_L = { cylinder_map: { 4: cyl4, 6: cyl6, 8: cyl8 } };
        }
    }

    // ── UPDATED: Average_Fuel_Consumption_L ──────────────────
    if (state.sections.Average_Fuel_Consumption_L) {
        const noiseMean = parseRequiredNumber(state.averageFuelConsumption.noise_mean, "Avg fuel noise mean", errors);
        const noiseStd  = parseRequiredNumber(state.averageFuelConsumption.noise_std,  "Avg fuel noise std",  errors, { min: 0 });
        if ([noiseMean, noiseStd].every((v) => v !== null)) {
            payload.Average_Fuel_Consumption_L = { noise_mean: noiseMean, noise_std: noiseStd };
        }
    }

    // Fuel_Deviation_L and Fuel_Deviation_Ratio: no dict branch in Python — flags only
    if (state.sections.Fuel_Deviation_L) {
        payload.Fuel_Deviation_L = true;
    }

    if (state.sections.Fuel_Deviation_Ratio) {
        payload.Fuel_Deviation_Ratio = true;
    }

    if (state.sections.Previous_Subsidy_Received) {
        const pvalue = parseProbabilityList(state.previousSubsidy.pvalue, "Previous subsidy probabilities", 2, errors);
        const amountMean = parseRequiredNumber(state.previousSubsidy.amount_mean, "Previous subsidy amount mean", errors);
        const amountStd  = parseRequiredNumber(state.previousSubsidy.amount_std,  "Previous subsidy amount standard deviation", errors, { min: 0 });
        const amountMin  = parseRequiredNumber(state.previousSubsidy.amount_min,  "Previous subsidy minimum amount", errors, { min: 0 });
        const amountMax  = parseRequiredNumber(state.previousSubsidy.amount_max,  "Previous subsidy maximum amount", errors, { min: 0 });

        if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
            errors.push("Previous subsidy minimum amount must be less than or equal to the maximum amount.");
        }

        if (pvalue && [amountMean, amountStd, amountMin, amountMax].every((v) => v !== null)) {
            payload.Previous_Subsidy_Received = {
                pvalue,
                amount_mean: amountMean,
                amount_std: amountStd,
                amount_min: amountMin,
                amount_max: amountMax
            };
        }
    }

    if (state.sections.Late_or_Missed_Renewals) {
        const lam = parseRequiredNumber(state.lateRenewals.lam, "Late or missed renewals lambda", errors, { min: 0 });
        if (lam !== null) payload.Late_or_Missed_Renewals = { lam };
    }

    if (state.sections.Applications_Last_12_Months) {
        const lam = parseRequiredNumber(state.applicationsLast12Months.lam, "Applications in last 12 months lambda", errors, { min: 0 });
        if (lam !== null) payload.Applications_Last_12_Months = { lam };
    }

    if (state.sections.ID) {
        payload.ID = true;
    }

    if (state.sections.Conditions) {
        const validGroups = [];

        state.conditionGroups.forEach((group, groupIndex) => {
            if (!group.rules.length) {
                errors.push(`Condition group ${groupIndex + 1} must contain at least one rule.`);
                return;
            }

            const parsedRules = [];
            group.rules.forEach((rule, ruleIndex) => {
                if (!rule.col || !rule.op || rule.val.trim() === "") {
                    errors.push(`Condition group ${groupIndex + 1}, rule ${ruleIndex + 1} is incomplete.`);
                    return;
                }

                try {
                    const parsedValue = parseRuleValue(rule.op, rule.val);
                    if ((rule.op === "in" || rule.op === "between") && !Array.isArray(parsedValue)) {
                        errors.push(`Condition group ${groupIndex + 1}, rule ${ruleIndex + 1} must use an array value.`);
                        return;
                    }

                    if (rule.op === "between" && Array.isArray(parsedValue) && parsedValue.length !== 2) {
                        errors.push(`Condition group ${groupIndex + 1}, rule ${ruleIndex + 1} must have exactly two values for "between".`);
                        return;
                    }

                    parsedRules.push({ col: rule.col, op: rule.op, val: parsedValue });
                } catch (error) {
                    errors.push(`Condition group ${groupIndex + 1}, rule ${ruleIndex + 1}: ${error.message}`);
                }
            });

            if (parsedRules.length === group.rules.length) {
                validGroups.push(parsedRules);
            }
        });

        if (validGroups.length) {
            payload.Conditions = validGroups;
        }
    }

    if (state.sections.fraudmulti) {
        const sectionFraudFraction = parseRequiredNumber(state.fraudProfile.fraud_fraction, "Fraud profile fraction", errors, { min: 0.000001, max: 0.999999, allowZero: false });
        const fuelMultiplier = parseRequiredNumber(state.fraudProfile.fuel_multiplier, "Fuel multiplier", errors, { min: 0.1, allowZero: false });
        const appsBoost = parseRequiredNumber(state.fraudProfile.apps_boost, "Applications boost", errors, { integer: true, min: 0 });
        const renewalsBoost = parseRequiredNumber(state.fraudProfile.renewals_boost, "Renewals boost", errors, { integer: true, min: 0 });

        if ([sectionFraudFraction, fuelMultiplier, appsBoost, renewalsBoost].every((v) => v !== null)) {
            payload.fraudmulti = {
                fraud_fraction: sectionFraudFraction,
                fuel_multiplier: fuelMultiplier,
                apps_boost: appsBoost,
                renewals_boost: renewalsBoost
            };
        }
    }

    return {
        errors,
        payload: payload,
        legacyPayload: normalizeLegacyPayload(payload)
    };
}

function copyText(text) {
    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return Promise.resolve();
}

function InfoCard({ title, children, theme }) {
    return (
        <Card
            className="mb-4"
            style={{
                backgroundColor: theme.altBackground,
                borderRadius: "14px",
                boxShadow: "0 10px 26px var(--shadowColor)",
                border: "1px solid rgba(102, 187, 106, 0.2)"
            }}
        >
            <CardHeader
                style={{
                    background: "linear-gradient(90deg, var(--primaryColor), var(--tertiaryColor))",
                    borderBottom: "1px solid rgba(102, 187, 106, 0.2)",
                    color: theme.textColorAlt,
                    fontWeight: "700"
                }}
            >
                {title}
            </CardHeader>
            <CardBody>{children}</CardBody>
        </Card>
    );
}

export default function DataCreator() {
    const { theme } = useTheme();
    const [formState, setFormState] = useState(getInitialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverResult, setServerResult] = useState(null);

    const serialized = serializeRequest(formState);
    const previewText = JSON.stringify(serialized.payload, null, 2);

    const sectionWrapperStyle = {
        border: "1px solid rgba(102, 187, 106, 0.18)",
        borderRadius: "12px",
        padding: "16px",
        background: theme.primaryBackground,
        marginBottom: "16px"
    };

    const inputStyle = {
        backgroundColor: theme.altBackground,
        color: theme.textColorAlt,
        border: "1px solid rgba(102, 187, 106, 0.25)"
    };

    const updateBasics = (key, value) => {
        setFormState((current) => ({ ...current, basics: { ...current.basics, [key]: value } }));
    };

    const updateSection = (groupKey, key, value) => {
        setFormState((current) => ({ ...current, [groupKey]: { ...current[groupKey], [key]: value } }));
    };

    const toggleSection = (sectionKey) => {
        setFormState((current) => ({
            ...current,
            sections: { ...current.sections, [sectionKey]: !current.sections[sectionKey] }
        }));
    };

    const setSectionsState = (sectionKeys, value) => {
        setFormState((current) => ({
            ...current,
            sections: sectionKeys.reduce(
                (updatedSections, key) => ({ ...updatedSections, [key]: value }),
                { ...current.sections }
            )
        }));
    };

    const addConditionGroup = () => {
        setFormState((current) => ({
            ...current,
            conditionGroups: [...current.conditionGroups, createGroup()]
        }));
    };

    const removeConditionGroup = (groupId) => {
        setFormState((current) => ({
            ...current,
            conditionGroups:
                current.conditionGroups.length === 1
                    ? [createGroup()]
                    : current.conditionGroups.filter((group) => group.id !== groupId)
        }));
    };

    const addRuleToGroup = (groupId) => {
        setFormState((current) => ({
            ...current,
            conditionGroups: current.conditionGroups.map((group) =>
                group.id === groupId ? { ...group, rules: [...group.rules, createRule()] } : group
            )
        }));
    };

    const removeRuleFromGroup = (groupId, ruleId) => {
        setFormState((current) => ({
            ...current,
            conditionGroups: current.conditionGroups.map((group) => {
                if (group.id !== groupId) return group;
                if (group.rules.length === 1) return { ...group, rules: [createRule()] };
                return { ...group, rules: group.rules.filter((rule) => rule.id !== ruleId) };
            })
        }));
    };

    const updateConditionRule = (groupId, ruleId, key, value) => {
        setFormState((current) => ({
            ...current,
            conditionGroups: current.conditionGroups.map((group) =>
                group.id === groupId
                    ? {
                        ...group,
                        rules: group.rules.map((rule) =>
                            rule.id === ruleId ? { ...rule, [key]: value } : rule
                        )
                    }
                    : group
            )
        }));
    };

    const handleCopy = async () => {
        if (serialized.errors.length) { toast.error("Fix validation errors before copying the payload."); return; }
        try {
            await copyText(previewText);
            toast.success("Request payload copied.");
        } catch (error) {
            toast.error("Unable to copy the payload.");
        }
    };

    const handleDownload = () => {
        if (serialized.errors.length) { toast.error("Fix validation errors before downloading the payload."); return; }
        const blob = new Blob([previewText], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "synthetic-data-request.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Request payload downloaded.");
    };

    const handleReset = () => {
        setFormState(getInitialState());
        setServerResult(null);
        toast.success("Form reset to defaults.");
    };

    const handleGenerate = async () => {
        if (serialized.errors.length) { toast.error("Fix validation errors before generating data."); return; }
        setIsSubmitting(true);
        setServerResult(null);
        try {
            const response = await axios.post(`http://localhost:${API_PORT}/createData`, serialized.payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
            });
            setServerResult(response.data);
            toast.success(response.data.serverMsg || "Synthetic dataset generated.");
        } catch (error) {
            const serverMsg =
                error.response?.data?.serverMsg ||
                error.response?.data?.error ||
                "Failed to generate the synthetic dataset.";
            toast.error(serverMsg);
            setServerResult(error.response?.data || null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSectionCard = (title, toggleId, checked, onToggle, children) => (
        <div style={sectionWrapperStyle}>
            <FormGroup check className="mb-3">
                <Input id={toggleId} type="checkbox" checked={checked} onChange={onToggle} />
                <Label check for={toggleId} style={{ color: theme.textColorAlt, fontWeight: "600" }}>
                    {title}
                </Label>
            </FormGroup>
            {checked && children}
        </div>
    );

    return (
        <Container className="py-4" style={{ minHeight: "80vh" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 style={{ color: theme.textColorAlt, marginBottom: "8px" }}>Synthetic Dataset Builder</h2>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <Button className="mainButton" onClick={handleGenerate} disabled={isSubmitting}>
                        {isSubmitting ? "Generating..." : "Generate Dataset"}
                    </Button>
                    <Button color="secondary" onClick={handleReset}>
                        <FaRotateLeft className="me-2" />
                        Reset
                    </Button>
                </div>
            </div>

            <Row className="g-4">
                <Col xl="7">
                    <InfoCard title="What This Page Builds" theme={theme}>
                        <CardTitle tag="h5" style={{ color: theme.textColorAlt }}>
                            Compose the request body, preview it, and optionally send it to the linked backend.
                        </CardTitle>
                    </InfoCard>

                    <InfoCard title="Basic Setup" theme={theme}>
                        <Row className="g-3">
                            <Col md="4"><FormGroup><Label for="nEligible" style={{ color: theme.textColorAlt }}>Number of eligible records</Label><Input id="nEligible" type="number" value={formState.basics.n_eligible} onChange={(e) => updateBasics("n_eligible", e.target.value)} style={inputStyle} /></FormGroup></Col>
                            <Col md="4"><FormGroup><Label for="nIneligible" style={{ color: theme.textColorAlt }}>Number of ineligible records</Label><Input id="nIneligible" type="number" value={formState.basics.n_ineligible} onChange={(e) => updateBasics("n_ineligible", e.target.value)} style={inputStyle} /></FormGroup></Col>
                            <Col md="4"><FormGroup><Label for="fraudFraction" style={{ color: theme.textColorAlt }}>Top-level fraud fraction</Label><Input id="fraudFraction" type="number" step="0.01" value={formState.basics.fraud_fraction} onChange={(e) => updateBasics("fraud_fraction", e.target.value)} style={inputStyle} /></FormGroup></Col>
                        </Row>
                    </InfoCard>

                    <InfoCard title="Common Field Generators" theme={theme}>
                        <div className="d-flex gap-2 flex-wrap mb-3">
                            <Button className="simpleButton" style={{backgroundColor:theme.primaryColor}} size="sm" onClick={() => setSectionsState(commonSectionKeys, true)}>Select All</Button>
                            <Button color="secondary" size="sm" onClick={() => setSectionsState(commonSectionKeys, false)}>Clear All</Button>
                        </div>

                        {renderSectionCard("Age generator", "ageToggle", formState.sections.Age, () => toggleSection("Age"),
                            <Row className="g-3">
                                <Col md="3"><Label for="ageCenter" style={{ color: theme.textColorAlt }}>Center</Label><Input id="ageCenter" type="number" value={formState.age.Center} onChange={(e) => updateSection("age", "Center", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="ageScale" style={{ color: theme.textColorAlt }}>Scale</Label><Input id="ageScale" type="number" value={formState.age.Scale} onChange={(e) => updateSection("age", "Scale", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="minAge" style={{ color: theme.textColorAlt }}>Minimum age</Label><Input id="minAge" type="number" value={formState.age.minAge} onChange={(e) => updateSection("age", "minAge", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="maxAge" style={{ color: theme.textColorAlt }}>Maximum age</Label><Input id="maxAge" type="number" value={formState.age.maxAge} onChange={(e) => updateSection("age", "maxAge", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Gender generator", "genderToggle", formState.sections.Gender, () => toggleSection("Gender"),
                            <FormGroup><Label for="genderPValue" style={{ color: theme.textColorAlt }}>Probabilities for Male, Female</Label><Input id="genderPValue" value={formState.gender.pValue} onChange={(e) => updateSection("gender", "pValue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Marital status generator", "maritalToggle", formState.sections.Marital_Status, () => toggleSection("Marital_Status"),
                            <FormGroup><Label for="maritalPValue" style={{ color: theme.textColorAlt }}>Probabilities for Single, Married, Divorced, Widowed</Label><Input id="maritalPValue" value={formState.marital.pValue} onChange={(e) => updateSection("marital", "pValue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Governorate generator", "governorateToggle", formState.sections.Governorate, () => toggleSection("Governorate"),
                            <Row className="g-3">
                                <Col md="6"><Label for="cities" style={{ color: theme.textColorAlt }}>Cities</Label><Input id="cities" type="textarea" rows="3" value={formState.governorate.City} onChange={(e) => updateSection("governorate", "City", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="cityWeights" style={{ color: theme.textColorAlt }}>Probabilities</Label><Input id="cityWeights" type="textarea" rows="3" value={formState.governorate.PvalueSize} onChange={(e) => updateSection("governorate", "PvalueSize", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Household size generator", "householdSizeToggle", formState.sections.Household_Size, () => toggleSection("Household_Size"),
                            <Row className="g-3">
                                <Col md="4"><Label for="householdLambda" style={{ color: theme.textColorAlt }}>Lambda</Label><Input id="householdLambda" type="number" value={formState.householdSize.lam} onChange={(e) => updateSection("householdSize", "lam", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="householdMin" style={{ color: theme.textColorAlt }}>Minimum size</Label><Input id="householdMin" type="number" value={formState.householdSize.MinHsize} onChange={(e) => updateSection("householdSize", "MinHsize", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="householdMax" style={{ color: theme.textColorAlt }}>Maximum size</Label><Input id="householdMax" type="number" value={formState.householdSize.MaxHsize} onChange={(e) => updateSection("householdSize", "MaxHsize", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Salary generator", "salaryToggle", formState.sections.Salary, () => toggleSection("Salary"),
                            <Row className="g-3">
                                <Col md="4"><Label for="eligibleMean" style={{ color: theme.textColorAlt }}>Eligible mean</Label><Input id="eligibleMean" type="number" value={formState.salary.eloc} onChange={(e) => updateSection("salary", "eloc", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="eligibleScale" style={{ color: theme.textColorAlt }}>Eligible scale</Label><Input id="eligibleScale" type="number" value={formState.salary.escale} onChange={(e) => updateSection("salary", "escale", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="minimumSalary" style={{ color: theme.textColorAlt }}>Minimum salary</Label><Input id="minimumSalary" type="number" value={formState.salary.minSalary} onChange={(e) => updateSection("salary", "minSalary", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="ineligibleMean" style={{ color: theme.textColorAlt }}>Ineligible mean</Label><Input id="ineligibleMean" type="number" value={formState.salary.inloc} onChange={(e) => updateSection("salary", "inloc", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="ineligibleScale" style={{ color: theme.textColorAlt }}>Ineligible scale</Label><Input id="ineligibleScale" type="number" value={formState.salary.inscale} onChange={(e) => updateSection("salary", "inscale", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Degree level generator", "degreeLevelToggle", formState.sections.Degree_Level, () => toggleSection("Degree_Level"),
                            <FormGroup><Label for="degreeLevelWeights" style={{ color: theme.textColorAlt }}>Probabilities for None, HighSchool, Diploma, Bachelor, Master</Label><Input id="degreeLevelWeights" value={formState.degreeLevel.pvalue} onChange={(e) => updateSection("degreeLevel", "pvalue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Employment status generator", "employmentToggle", formState.sections.Employment_Status, () => toggleSection("Employment_Status"),
                            <FormGroup><Label for="employmentWeights" style={{ color: theme.textColorAlt }}>Probabilities for Employed, Unemployed, Student, Retired</Label><Input id="employmentWeights" value={formState.employment.pvalue} onChange={(e) => updateSection("employment", "pvalue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Primary income source generator", "primaryIncomeToggle", formState.sections.Primary_Income_Source, () => toggleSection("Primary_Income_Source"),
                            <FormGroup><Label for="primaryIncomeWeights" style={{ color: theme.textColorAlt }}>Probabilities for Government, Private, SelfEmployed, None</Label><Input id="primaryIncomeWeights" value={formState.primaryIncomeSource.pvalue} onChange={(e) => updateSection("primaryIncomeSource", "pvalue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Other social benefits generator", "otherBenefitsToggle", formState.sections.Has_Other_Social_Benefits, () => toggleSection("Has_Other_Social_Benefits"),
                            <FormGroup><Label for="otherBenefitsWeights" style={{ color: theme.textColorAlt }}>Probabilities for 0, 1</Label><Input id="otherBenefitsWeights" value={formState.otherBenefits.pvalue} onChange={(e) => updateSection("otherBenefits", "pvalue", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Assets value generator", "assetsValueToggle", formState.sections.Assets_Value, () => toggleSection("Assets_Value"),
                            <Row className="g-3">
                                <Col md="6"><Label for="eligibleAssetsMean" style={{ color: theme.textColorAlt }}>Eligible mean</Label><Input id="eligibleAssetsMean" type="number" value={formState.assetsValue.eligible_mean} onChange={(e) => updateSection("assetsValue", "eligible_mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="eligibleAssetsSigma" style={{ color: theme.textColorAlt }}>Eligible sigma</Label><Input id="eligibleAssetsSigma" type="number" value={formState.assetsValue.eligible_sigma} onChange={(e) => updateSection("assetsValue", "eligible_sigma", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="ineligibleAssetsMean" style={{ color: theme.textColorAlt }}>Ineligible mean</Label><Input id="ineligibleAssetsMean" type="number" value={formState.assetsValue.ineligible_mean} onChange={(e) => updateSection("assetsValue", "ineligible_mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="ineligibleAssetsSigma" style={{ color: theme.textColorAlt }}>Ineligible sigma</Label><Input id="ineligibleAssetsSigma" type="number" value={formState.assetsValue.ineligible_sigma} onChange={(e) => updateSection("assetsValue", "ineligible_sigma", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Liabilities value generator", "liabilitiesValueToggle", formState.sections.Liabilities_Value, () => toggleSection("Liabilities_Value"),
                            <Row className="g-3">
                                <Col md="6"><Label for="liabilitiesMean" style={{ color: theme.textColorAlt }}>Mean</Label><Input id="liabilitiesMean" type="number" value={formState.liabilitiesValue.mean} onChange={(e) => updateSection("liabilitiesValue", "mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="liabilitiesSigma" style={{ color: theme.textColorAlt }}>Sigma</Label><Input id="liabilitiesSigma" type="number" value={formState.liabilitiesValue.sigma} onChange={(e) => updateSection("liabilitiesValue", "sigma", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Number of children generator", "numberOfChildrenToggle", formState.sections.Number_of_Children, () => toggleSection("Number_of_Children"),
                            <Row className="g-3">
                                <Col md="6"><Label for="childrenLambda" style={{ color: theme.textColorAlt }}>Lambda</Label><Input id="childrenLambda" type="number" value={formState.numberOfChildren.lam} onChange={(e) => updateSection("numberOfChildren", "lam", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="childrenMax" style={{ color: theme.textColorAlt }}>Maximum children</Label><Input id="childrenMax" type="number" value={formState.numberOfChildren.max} onChange={(e) => updateSection("numberOfChildren", "max", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Spouse income generator", "spouseIncomeToggle", formState.sections.Total_Spouse_Income, () => toggleSection("Total_Spouse_Income"),
                            <Row className="g-3">
                                <Col md="4"><Label for="spouseIncomeMean" style={{ color: theme.textColorAlt }}>Mean</Label><Input id="spouseIncomeMean" type="number" value={formState.spouseIncome.mean} onChange={(e) => updateSection("spouseIncome", "mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="spouseIncomeSigma" style={{ color: theme.textColorAlt }}>Sigma</Label><Input id="spouseIncomeSigma" type="number" value={formState.spouseIncome.sigma} onChange={(e) => updateSection("spouseIncome", "sigma", e.target.value)} style={inputStyle} /></Col>
                                <Col md="4"><Label for="spouseIncomeMax" style={{ color: theme.textColorAlt }}>Maximum</Label><Input id="spouseIncomeMax" type="number" value={formState.spouseIncome.max} onChange={(e) => updateSection("spouseIncome", "max", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Children income generator", "childrenIncomeToggle", formState.sections.Total_Children_Income, () => toggleSection("Total_Children_Income"),
                            <Row className="g-3">
                                <Col md="6"><Label for="childrenIncomeMean" style={{ color: theme.textColorAlt }}>Mean</Label><Input id="childrenIncomeMean" type="number" value={formState.childrenIncome.mean} onChange={(e) => updateSection("childrenIncome", "mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="childrenIncomeSigma" style={{ color: theme.textColorAlt }}>Sigma</Label><Input id="childrenIncomeSigma" type="number" value={formState.childrenIncome.sigma} onChange={(e) => updateSection("childrenIncome", "sigma", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Previous subsidy generator", "previousToggle", formState.sections.Previous_Subsidy_Received, () => toggleSection("Previous_Subsidy_Received"),
                            <Row className="g-3">
                                <Col md="6"><Label for="previousProbabilities" style={{ color: theme.textColorAlt }}>Probabilities for Not received, Received</Label><Input id="previousProbabilities" value={formState.previousSubsidy.pvalue} onChange={(e) => updateSection("previousSubsidy", "pvalue", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="previousMean" style={{ color: theme.textColorAlt }}>Mean</Label><Input id="previousMean" type="number" value={formState.previousSubsidy.amount_mean} onChange={(e) => updateSection("previousSubsidy", "amount_mean", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="previousStd" style={{ color: theme.textColorAlt }}>Std. dev.</Label><Input id="previousStd" type="number" value={formState.previousSubsidy.amount_std} onChange={(e) => updateSection("previousSubsidy", "amount_std", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="previousMin" style={{ color: theme.textColorAlt }}>Minimum amount</Label><Input id="previousMin" type="number" value={formState.previousSubsidy.amount_min} onChange={(e) => updateSection("previousSubsidy", "amount_min", e.target.value)} style={inputStyle} /></Col>
                                <Col md="6"><Label for="previousMax" style={{ color: theme.textColorAlt }}>Maximum amount</Label><Input id="previousMax" type="number" value={formState.previousSubsidy.amount_max} onChange={(e) => updateSection("previousSubsidy", "amount_max", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}

                        {renderSectionCard("Late or missed renewals generator", "lateRenewalsToggle", formState.sections.Late_or_Missed_Renewals, () => toggleSection("Late_or_Missed_Renewals"),
                            <FormGroup><Label for="lateRenewalsLambda" style={{ color: theme.textColorAlt }}>Lambda</Label><Input id="lateRenewalsLambda" type="number" value={formState.lateRenewals.lam} onChange={(e) => updateSection("lateRenewals", "lam", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Applications in last 12 months generator", "applications12MonthsToggle", formState.sections.Applications_Last_12_Months, () => toggleSection("Applications_Last_12_Months"),
                            <FormGroup><Label for="applications12MonthsLambda" style={{ color: theme.textColorAlt }}>Lambda</Label><Input id="applications12MonthsLambda" type="number" value={formState.applicationsLast12Months.lam} onChange={(e) => updateSection("applicationsLast12Months", "lam", e.target.value)} style={inputStyle} /></FormGroup>
                        )}

                        {renderSectionCard("Random ID generator", "idGeneratorToggle", formState.sections.ID, () => toggleSection("ID"),
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>Enable this to let the backend populate an `ID` column with generated values.</CardText>
                        )}
                    </InfoCard>

                    <InfoCard title="Derived And Vehicle Fields" theme={theme}>
                        <CardText style={{ color: theme.textColorAlt }}>
                            These fields are derived from existing fields based on the defined distribution
                        </CardText>
                        <div className="d-flex gap-2 flex-wrap mb-3">
                            <Button className="simpleButton" style={{backgroundColor:theme.primaryColor}} size="sm" onClick={() => setSectionsState(derivedSectionKeys, true)}>Select All</Button>
                            <Button color="secondary" size="sm" onClick={() => setSectionsState(derivedSectionKeys, false)}>Clear All</Button>
                        </div>

                        {/* ── UPDATED: Working_Children_Count ── */}
                        {renderSectionCard("Working children count", "workingChildrenToggle", formState.sections.Working_Children_Count, () => toggleSection("Working_Children_Count"),
                            <Row className="g-3">
                                <Col md="6">
                                    <Label for="workingChildrenPYoung" style={{ color: theme.textColorAlt }}>P(child works) — applicant age &lt; 35</Label>
                                    <Input id="workingChildrenPYoung" type="number" step="0.01" value={formState.workingChildrenCount.p_young} onChange={(e) => updateSection("workingChildrenCount", "p_young", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="6">
                                    <Label for="workingChildrenPOld" style={{ color: theme.textColorAlt }}>P(child works) — applicant age ≥ 35</Label>
                                    <Input id="workingChildrenPOld" type="number" step="0.01" value={formState.workingChildrenCount.p_old} onChange={(e) => updateSection("workingChildrenCount", "p_old", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {renderSectionCard("Total household income", "totalHouseholdIncomeToggle", formState.sections.Total_Household_Income, () => toggleSection("Total_Household_Income"),
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>Generate `Total_Household_Income` from salary, spouse income, and children income.</CardText>
                        )}

                        {/* ── UPDATED: Vehicle_Ownership ── */}
                        {renderSectionCard("Vehicle ownership", "vehicleOwnershipToggle", formState.sections.Vehicle_Ownership, () => toggleSection("Vehicle_Ownership"),
                            <FormGroup>
                                <Label for="vehicleOwnershipPValue" style={{ color: theme.textColorAlt }}>Probabilities for No vehicle, Has vehicle</Label>
                                <Input id="vehicleOwnershipPValue" value={formState.vehicleOwnership.pvalue} onChange={(e) => updateSection("vehicleOwnership", "pvalue", e.target.value)} style={inputStyle} />
                            </FormGroup>
                        )}

                        {/* ── UPDATED: Vehicle_Count ── */}
                        {renderSectionCard("Vehicle count", "vehicleCountToggle", formState.sections.Vehicle_Count, () => toggleSection("Vehicle_Count"),
                            <FormGroup>
                                <Label for="vehicleCountLambda" style={{ color: theme.textColorAlt }}>Lambda</Label>
                                <Input id="vehicleCountLambda" type="number" value={formState.vehicleCount.lam} onChange={(e) => updateSection("vehicleCount", "lam", e.target.value)} style={inputStyle} />
                            </FormGroup>
                        )}

                        {/* ── UPDATED: Cylinder_Count ── */}
                        {renderSectionCard("Cylinder count", "cylinderCountToggle", formState.sections.Cylinder_Count, () => toggleSection("Cylinder_Count"),
                            <Row className="g-3">
                                <Col md="6">
                                    <Label for="cylinderOptions" style={{ color: theme.textColorAlt }}>Cylinder options (comma-separated integers)</Label>
                                    <Input id="cylinderOptions" value={formState.cylinderCount.options} onChange={(e) => updateSection("cylinderCount", "options", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="6">
                                    <Label for="cylinderPValue" style={{ color: theme.textColorAlt }}>Probabilities (must match option count)</Label>
                                    <Input id="cylinderPValue" value={formState.cylinderCount.pvalue} onChange={(e) => updateSection("cylinderCount", "pvalue", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {/* ── UPDATED: Vehicle_Age_Years ── */}
                        {renderSectionCard("Vehicle age in years", "vehicleAgeToggle", formState.sections.Vehicle_Age_Years, () => toggleSection("Vehicle_Age_Years"),
                            <Row className="g-3">
                                <Col md="4">
                                    <Label for="vehicleAgeLambda" style={{ color: theme.textColorAlt }}>Lambda</Label>
                                    <Input id="vehicleAgeLambda" type="number" value={formState.vehicleAge.lam} onChange={(e) => updateSection("vehicleAge", "lam", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="4">
                                    <Label for="vehicleAgeMin" style={{ color: theme.textColorAlt }}>Minimum age</Label>
                                    <Input id="vehicleAgeMin" type="number" value={formState.vehicleAge.min} onChange={(e) => updateSection("vehicleAge", "min", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="4">
                                    <Label for="vehicleAgeMax" style={{ color: theme.textColorAlt }}>Maximum age</Label>
                                    <Input id="vehicleAgeMax" type="number" value={formState.vehicleAge.max} onChange={(e) => updateSection("vehicleAge", "max", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {/* ── UPDATED: Fuel_Type ── */}
                        {renderSectionCard("Fuel type", "fuelTypeToggle", formState.sections.Fuel_Type, () => toggleSection("Fuel_Type"),
                            <Row className="g-3">
                                <Col md="6">
                                    <Label for="fuelTypeOptions" style={{ color: theme.textColorAlt }}>Fuel options (comma-separated)</Label>
                                    <Input id="fuelTypeOptions" value={formState.fuelType.options} onChange={(e) => updateSection("fuelType", "options", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="6">
                                    <Label for="fuelTypePValue" style={{ color: theme.textColorAlt }}>Probabilities (must match option count)</Label>
                                    <Input id="fuelTypePValue" value={formState.fuelType.pvalue} onChange={(e) => updateSection("fuelType", "pvalue", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {/* ── UPDATED: Expected_Fuel_Consumption_L ── */}
                        {renderSectionCard("Expected fuel consumption", "expectedFuelToggle", formState.sections.Expected_Fuel_Consumption_L, () => toggleSection("Expected_Fuel_Consumption_L"),
                            <Row className="g-3">
                                <Col md="4">
                                    <Label for="expectedFuel4" style={{ color: theme.textColorAlt }}>4-cylinder (L/month)</Label>
                                    <Input id="expectedFuel4" type="number" value={formState.expectedFuelConsumption.cyl4} onChange={(e) => updateSection("expectedFuelConsumption", "cyl4", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="4">
                                    <Label for="expectedFuel6" style={{ color: theme.textColorAlt }}>6-cylinder (L/month)</Label>
                                    <Input id="expectedFuel6" type="number" value={formState.expectedFuelConsumption.cyl6} onChange={(e) => updateSection("expectedFuelConsumption", "cyl6", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="4">
                                    <Label for="expectedFuel8" style={{ color: theme.textColorAlt }}>8-cylinder (L/month)</Label>
                                    <Input id="expectedFuel8" type="number" value={formState.expectedFuelConsumption.cyl8} onChange={(e) => updateSection("expectedFuelConsumption", "cyl8", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {/* ── UPDATED: Average_Fuel_Consumption_L ── */}
                        {renderSectionCard("Average fuel consumption", "averageFuelToggle", formState.sections.Average_Fuel_Consumption_L, () => toggleSection("Average_Fuel_Consumption_L"),
                            <Row className="g-3">
                                <Col md="6">
                                    <Label for="avgFuelNoiseMean" style={{ color: theme.textColorAlt }}>Noise mean</Label>
                                    <Input id="avgFuelNoiseMean" type="number" value={formState.averageFuelConsumption.noise_mean} onChange={(e) => updateSection("averageFuelConsumption", "noise_mean", e.target.value)} style={inputStyle} />
                                </Col>
                                <Col md="6">
                                    <Label for="avgFuelNoiseStd" style={{ color: theme.textColorAlt }}>Noise std. dev.</Label>
                                    <Input id="avgFuelNoiseStd" type="number" value={formState.averageFuelConsumption.noise_std} onChange={(e) => updateSection("averageFuelConsumption", "noise_std", e.target.value)} style={inputStyle} />
                                </Col>
                            </Row>
                        )}

                        {renderSectionCard("Fuel deviation in liters", "fuelDeviationToggle", formState.sections.Fuel_Deviation_L, () => toggleSection("Fuel_Deviation_L"),
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>Generate `Fuel_Deviation_L` from the expected and average fuel columns.</CardText>
                        )}

                        {renderSectionCard("Fuel deviation ratio", "fuelDeviationRatioToggle", formState.sections.Fuel_Deviation_Ratio, () => toggleSection("Fuel_Deviation_Ratio"),
                            <CardText style={{ color: theme.textColorAlt, marginBottom: 0 }}>Generate `Fuel_Deviation_Ratio` from the expected and average fuel columns.</CardText>
                        )}
                    </InfoCard>

                    <InfoCard title="Eligibility Rules" theme={theme}>
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                            <FormGroup check>
                                <Input id="conditionsToggle" type="checkbox" checked={formState.sections.Conditions} onChange={() => toggleSection("Conditions")} />
                                <Label check for="conditionsToggle" style={{ color: theme.textColorAlt, fontWeight: "600" }}>Enable condition builder</Label>
                            </FormGroup>
                            <Button className="simpleButton" style={{backgroundColor:theme.primaryColor}} onClick={addConditionGroup} disabled={!formState.sections.Conditions}><FaPlus className="me-2" />Add OR group</Button>
                        </div>
                        <CardText style={{ color: theme.textColorAlt }}>
                            Rules inside one group are AND-ed together. Each group is OR-ed with the others. Use JSON array syntax for in and between, such as ["Student","Unemployed"] or [18,24].
                        </CardText>
                        {formState.sections.Conditions && formState.conditionGroups.map((group, groupIndex) => (
                            <div key={group.id} style={sectionWrapperStyle}>
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <div style={{ color: theme.textColorAlt, fontWeight: "600" }}>Group {groupIndex + 1}</div>
                                    <div className="d-flex gap-2">
                                        <Button className="simpleButton" style={{backgroundColor:theme.primaryColor}} size="sm" onClick={() => addRuleToGroup(group.id)}><FaPlus className="me-2" />Add rule</Button>
                                        <Button className="simpleButton" style={{backgroundColor:theme.secondaryColor}} size="sm" onClick={() => removeConditionGroup(group.id)}><FaTrash className="me-2" />Remove group</Button>
                                    </div>
                                </div>
                                {group.rules.map((rule, ruleIndex) => (
                                    <Row className="g-2 align-items-end mb-2" key={rule.id}>
                                        <Col lg="4"><Label for={`${rule.id}-col`} style={{ color: theme.textColorAlt }}>Field</Label><Input id={`${rule.id}-col`} type="select" value={rule.col} onChange={(e) => updateConditionRule(group.id, rule.id, "col", e.target.value)} style={inputStyle}>{conditionFieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}</Input></Col>
                                        <Col lg="2"><Label for={`${rule.id}-op`} style={{ color: theme.textColorAlt }}>Operator</Label><Input id={`${rule.id}-op`} type="select" value={rule.op} onChange={(e) => updateConditionRule(group.id, rule.id, "op", e.target.value)} style={inputStyle}>{operatorOptions.map((option) => <option key={option} value={option}>{option}</option>)}</Input></Col>
                                        <Col lg="5"><Label for={`${rule.id}-val`} style={{ color: theme.textColorAlt }}>Value</Label><Input id={`${rule.id}-val`} value={rule.val} onChange={(e) => updateConditionRule(group.id, rule.id, "val", e.target.value)} placeholder={rule.op === "between" ? "[18, 24]" : rule.op === "in" ? '["Student", "Unemployed"]' : "600"} style={inputStyle} /></Col>
                                        <Col lg="1" className="d-flex justify-content-end"><Button className="simpleButton" style={{backgroundColor:theme.secondaryColor}} size="sm" onClick={() => removeRuleFromGroup(group.id, rule.id)} aria-label={`Remove rule ${ruleIndex + 1}`}><FaTrash /></Button></Col>
                                    </Row>
                                ))}
                            </div>
                        ))}
                    </InfoCard>

                    <InfoCard title="Fraud Profile" theme={theme}>
                        <FormGroup check className="mb-3">
                            <Input id="fraudProfileToggle" type="checkbox" checked={formState.sections.fraudmulti} onChange={() => toggleSection("fraudmulti")} />
                            <Label check for="fraudProfileToggle" style={{ color: theme.textColorAlt, fontWeight: "600" }}>Enable fraud multiplier profile</Label>
                        </FormGroup>
                        <CardText style={{ color: theme.textColorAlt }}>
                            This section is used to boost suspicious usage patterns for fraud simulation.
                        </CardText>
                        {formState.sections.fraudmulti && (
                            <Row className="g-3">
                                <Col md="3"><Label for="fraudProfileFraction" style={{ color: theme.textColorAlt }}>Fraud fraction</Label><Input id="fraudProfileFraction" type="number" step="0.01" value={formState.fraudProfile.fraud_fraction} onChange={(e) => updateSection("fraudProfile", "fraud_fraction", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="fuelMultiplier" style={{ color: theme.textColorAlt }}>Fuel multiplier</Label><Input id="fuelMultiplier" type="number" step="0.1" value={formState.fraudProfile.fuel_multiplier} onChange={(e) => updateSection("fraudProfile", "fuel_multiplier", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="appsBoost" style={{ color: theme.textColorAlt }}>Applications boost</Label><Input id="appsBoost" type="number" value={formState.fraudProfile.apps_boost} onChange={(e) => updateSection("fraudProfile", "apps_boost", e.target.value)} style={inputStyle} /></Col>
                                <Col md="3"><Label for="renewalsBoost" style={{ color: theme.textColorAlt }}>Renewals boost</Label><Input id="renewalsBoost" type="number" value={formState.fraudProfile.renewals_boost} onChange={(e) => updateSection("fraudProfile", "renewals_boost", e.target.value)} style={inputStyle} /></Col>
                            </Row>
                        )}
                    </InfoCard>

                </Col>

                <Col xl="5">
                    <InfoCard title="Output" theme={theme}>
                        {serialized.errors.length > 0 ? (
                            <Alert color="danger"><div className="fw-semibold mb-2">Validation errors</div><ul className="mb-0 ps-3">{serialized.errors.map((error) => <li key={error}>{error}</li>)}</ul></Alert>
                        ) : (
                            <Alert color="success">Payload is valid and ready to copy, download, or generate.</Alert>
                        )}
                        <div className="d-flex gap-2 flex-wrap mb-3">
                            <Button color="dark" onClick={handleCopy} disabled={serialized.errors.length > 0}><FaCopy className="me-2" />Copy JSON</Button>
                            <Button className="simpleButton" style={{backgroundColor:theme.primaryColor}} onClick={handleDownload} disabled={serialized.errors.length > 0}><FaDownload className="me-2" />Download JSON</Button>
                        </div>
                        <pre data-testid="payload-preview" style={{ backgroundColor: theme.primaryBackground, color: theme.textColorAlt, borderRadius: "12px", padding: "16px", minHeight: "420px", maxHeight: "620px", overflow: "auto", marginBottom: 0, border: "1px solid rgba(102, 187, 106, 0.15)" }}>{previewText}</pre>
                    </InfoCard>

                </Col>
            </Row>
        </Container>
    );
}