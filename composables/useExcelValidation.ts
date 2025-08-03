import * as XLSX from "xlsx";
import {
    ExcelCellErrorType, ValidationCancellationError,
    type ExcelCellValidationError, type ExcelUniqueConstraint, type ExcelValidationComposable, type ExcelValidationSchema,
} from "../types/excel";

/**
 * Constant for row number offset.
 * Excel row numbers start from 1, but array indices start from 0.
 * Since the first row is the header, we add 2 to get the correct row number.
 */
const ROW_NUMBER_OFFSET = 2;

/**
 * Composable for validating Excel data and tracking validation progress.
 * Provides comprehensive Excel file validation including header validation,
 * data validation, and progress tracking.
 *
 * NOTE: All the helper functions mentioned here are written to make this composable independent of the project's helper functions.
 * So even if the project has its own helper functions, this composable will work without any changes. So don't change this logic.
 *
 * @returns {ExcelValidationComposable} Object containing validation functions and progress tracker
 * @example
 * ```typescript
 * const { validateHeader, validateData, validateExcelFile, validationProgress, isValidationCancelled, cancelValidation } = useExcelValidation();
 *
 * // Define validation schema
 * const schema: ExcelValidationSchema = {
 *  name: {
 *     type: "string",
 *     required: true,
 *   },
 *  department: {
 *     type: "string",
 *     required: true,
 *   },
 *   email: {
 *     type: "string",
 *     required: true,
 *     validators: { isEmail: true }
 *   },
 *   age: {
 *     type: "number",
 *     required: false
 *   }
 * };
 *
 * // Define unique constraints
 * const uniqueConstraints: ExcelUniqueConstraint = [["email"], ["name", "department"]];
 *
 * // Validate Excel file headers against the schema
 * const isValid = validateHeader(schema, excelHeaders);
 *
 * // Validate Excel data rows with progress tracking and return processed data
 * const { errors, processedData } = await validateData(data, schema, uniqueConstraints);
 * // errors: Array of validation errors found during processing
 * // processedData: Cleaned data with trimmed strings and standardized null values
 *
 * // Validate complete Excel file including headers, data, and unique constraints
 * const { rawData, processedData, errors } = await validateExcelFile(fileData, schema, uniqueConstraints);
 * // rawData: Original data from Excel file without any processing
 * // processedData: Cleaned data with trimmed strings and standardized null values and it consists only of the keys provided in the schema.
 * // errors: Array of validation errors found during processing
 *
 * // Handle validation cancellation
 * try {
 *   const result = await validateExcelFile(fileData, schema, uniqueConstraints);
 * } catch (error) {
 *   if (error instanceof ValidationCancellationError) {
 *     console.log("Partial errors:", error.errors);
 *   }
 * }
 * ```
 */
export const useExcelValidation = (): ExcelValidationComposable => {

    /**
     * Reactive reference tracking validation progress (0-100).
     *
     * Progress computation:
     * - Total steps = data rows + unique constraint sets.
     * - Progress increments by 1 for each processed row and each uniqueness check.
     * - Formula: Math.round((completedSteps / totalSteps) * 100)
     */
    const validationProgress = ref(0);

    /**
     * Reactive reference to track if validation has been cancelled.
     */
    const isValidationCancelled = ref(false);

    // Email validation function (simple regex)
    const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    // Employee number validation (7-9 digits)
    const isEmployeeNumber = (value: string | number): boolean => /^\d{7,9}$/.test(String(value));

    // Mobile number validation using regex (handles +91, 0 prefix, and trims spaces)
    const isMobileNumber = (value: string | number): boolean => /^(?:\+91|0)?\s*\d{10}$/.test(String(value).replace(/\s+/g, ""));

    // TODO: Add a new type: `isBusNumber` and need to test this.
    // Bus number validation (2 letters, 1-2 numbers, 1-2 letters, 4 numbers)
    const _isBusNumber = (value: string | number): boolean => /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}$/i.test(String(value));

    // TODO: Add a new type: `isGlobalEmployeeId`

    /**
     * Function to cancel the ongoing validation process.
     */
    const cancelValidation = (): void => {

        isValidationCancelled.value = true;
        validationProgress.value = 0;

    };

    const validateHeader = (excelSchema: ExcelValidationSchema, excelHeader: string[]): boolean => {

        const expectedHeaders = Object.keys(excelSchema);

        const excelHeaders = excelHeader.map(header => header.trim());

        // Check if all expected headers are present in the excel headers
        const missingHeaders = expectedHeaders.filter(h => !excelHeaders.includes(h));

        if (missingHeaders.length > 0) {

            console.group("%c[Excel Validation] Missing Columns Detected", "color: #b71c1c; font-weight: bold;");
            console.log("%cMissing Columns: %c%s", "color: #b71c1c; font-weight: bold;", "color: #d84315;", missingHeaders.join(", "));
            console.log("%cExpected Headers: %c%s", "color: #1565c0; font-weight: bold;", "color: #1976d2;", expectedHeaders.join(", "));
            console.log("%cFound Headers: %c%s", "color: #2e7d32; font-weight: bold;", "color: #388e3c;", excelHeaders.join(", "));
            console.groupEnd();

            return false;

        }

        // Check for extra columns in excelHeaders
        const extraHeaders = excelHeaders.filter(h => !expectedHeaders.includes(h));

        if (extraHeaders.length > 0) {

            // showWarningMessage(`Additional columns are present in the file: ${extraHeaders.join(",")}. These columns will be ignored.`);
            console.log(`Additional columns are present in the file: ${extraHeaders.join(",")}. These columns will be ignored.`);

        }

        return true;

    };

    // eslint-disable-next-line max-statements
    const validateData = async (data: Record<string, any>[], validationSchema: ExcelValidationSchema, unique: ExcelUniqueConstraint = [])
        : Promise<{ errors: ExcelCellValidationError[], processedData: Record<string, any>[] }> => {

        // Reset cancellation flag at the start of validation
        isValidationCancelled.value = false;

        validationProgress.value = 0;

        const errors: ExcelCellValidationError[] = [];

        const processedData: Record<string, any>[] = [];

        // Calculate the total number of validation steps: this includes validating each row of data and performing uniqueness checks for each unique column set.
        // This is used to track and update the validation progress accurately.
        const totalSteps = data.length + unique.length;

        // Helper function to calculate progress percentage
        const getProgress = (completed: number, total: number = totalSteps): number => Math.round((completed / total) * 100);

        // Helper function to update progress and allow UI updates
        const updateProgress = async (): Promise<void> => {

            completedSteps++;
            validationProgress.value = getProgress(completedSteps);
            await new Promise(resolve => setTimeout(resolve, 0));

        };

        let completedSteps = 0;

        // Use Map to track unique values and their row numbers
        const uniqueValues: { [key: string]: Map<string, number[]> } = {};

        // Initialize maps for uniqueness checks
        unique.forEach((cols) => {

            const key = cols.join("-").trim();

            uniqueValues[key] = new Map();

        });

        // Cache validation schema entries to avoid recomputation in the row loop
        const validationSchemaEntries = Object.entries(validationSchema);

        // Iterate through each data row to validate all fields and collect uniqueness data
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {

            // Check for cancellation before processing each row
            if (isValidationCancelled.value) {

                throw new ValidationCancellationError(errors);

            }

            const row = data[rowIndex];

            const processedRow: Record<string, any> = {};

            // Validate each field in the row based on the schema
            for (const [column, rules] of validationSchemaEntries) {

                const rawValue = row[column];

                const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

                // Store processed value in processedRow
                processedRow[column] = value;

                // rowNumber addition of ROW_NUMBER_OFFSET because rowIndex starts from 0 and the first row is the header.
                const rowNumber = rowIndex + ROW_NUMBER_OFFSET;

                // Step 1: Required field validation - Check if required fields have values
                if (rules.required && (value === null || value === "" || value === undefined)) {

                    errors.push({ row: rowNumber, column, message: "This field is required", errorType: ExcelCellErrorType.REQUIRED });

                    continue;

                }

                // Step 2: Type validation - Verify data type matches schema definition.
                // If a value is present (not null/undefined), verify it matches the expected type defined in the schema.
                // This check applies to both required and optional fields, as long as a value exists.
                if (rules.type && value != null) {

                    const typeCheck = typeof value === rules.type;

                    if (!typeCheck) {

                        errors.push({ row: rowNumber, column, message: `Expected type ${rules.type}, got ${typeof value}`, errorType: ExcelCellErrorType.TYPE_MISMATCH });

                        continue;

                    }

                }

                // Step 3: Format validation - Apply specific validators (email, mobile, employee number)
                // If a value is present (not null/undefined), apply specific validators (email, mobile, employee number) defined in the schema.
                // This validation is applied to both required and optional fields, as long as a value exists.
                if (rules.validators && value != null) {

                    if (rules.validators.isEmail && typeof value === "string" && !isEmail(value)) {

                        errors.push({ row: rowNumber, column, message: "Invalid email address", errorType: ExcelCellErrorType.EMAIL_RULE });

                    }

                    if (rules.validators.isMobileNumber && (typeof value === "string" || typeof value === "number") && !isMobileNumber(value)) {

                        errors.push({ row: rowNumber, column, message: "Invalid mobile number", errorType: ExcelCellErrorType.MOBILE_RULE });

                    }

                    if (rules.validators.isEmployeeNumber && (typeof value === "string" || typeof value === "number") && !isEmployeeNumber(value)) {

                        errors.push({ row: rowNumber, column, message: "Invalid employee number", errorType: ExcelCellErrorType.EMPLOYEE_RULE });

                    }

                }

                // Step 4: Accepted values validation - Check if value is in allowed list
                // If a value is present (not null/undefined), check if it is in the allowed list.
                // This validation is applied to both required and optional fields, as long as a value exists.
                if (rules.acceptedValues && value != null && !rules.acceptedValues.includes(value)) {

                    errors.push({ row: rowNumber, column, message: `Value must be one of: ${rules.acceptedValues.join(", ")}`, errorType: ExcelCellErrorType.ACCEPTED_VALUES });

                }

                // Step 5: Custom validation - Apply user-defined validation rules
                // If a value is present (not null/undefined), apply user-defined validation rules.
                // This validation is applied to both required and optional fields, as long as a value exists.
                if (rules.customValidator && value != null) {

                    const customResult = rules.customValidator(value);

                    if (customResult !== true) {

                        errors.push({ ...customResult, row: rowNumber, column });

                    }

                }

            }

            // Add processed row data to processedData array
            processedData.push(processedRow);

            // Step 6: Track values for uniqueness validation across all unique constraint sets
            unique.forEach((cols) => {

                const key = cols.join("-").trim();

                const values = cols.map((col) => {

                    const val = row[col];

                    return typeof val === "string" ? val.trim() : val ?? "NULL";

                }).join("-");

                const rowNumber = rowIndex + ROW_NUMBER_OFFSET;

                const valueMap = uniqueValues[key];

                if (valueMap.has(values)) {

                    // Duplicate found, add current row to the list
                    const existingRows = valueMap.get(values) ?? [];

                    valueMap.set(values, [...existingRows, rowNumber]);

                } else {

                    // Add new entry
                    valueMap.set(values, [rowNumber]);

                }

            });

            await updateProgress();

        }

        // Step 7: Uniqueness validation: check for duplicate values across all unique constraint sets
        for (const [key, valueMap] of Object.entries(uniqueValues)) {

            // Check for cancellation before processing each uniqueness constraint
            if (isValidationCancelled.value) {

                throw new ValidationCancellationError(errors);

            }

            // Check each unique value combination for duplicates
            valueMap.forEach((rows, value) => {

                if (rows.length > 1) {

                    const tempErrorList = rows.map(row => ({
                        row,
                        column: key,
                        message: `Duplicate value found: ${value} in rows ${rows.join(", ")}`,
                        errorType: ExcelCellErrorType.DUPLICATE,
                    }));

                    errors.push(...tempErrorList);

                }

            });

            // TODO: (Least Priority) If the progress bar seems to be slow at the end for large datasets, consider the data.length * unique.length for progress value.

            await updateProgress();

        }

        return { errors, processedData };

    };

    // Parses an Excel file, validates headers and data according to the provided schema and unique constraints,
    // and returns the raw data, processed (cleaned) data, and any validation errors found.
    const validateExcelFile = async (
        fileData: string | ArrayBuffer,
        schema: ExcelValidationSchema,
        unique: ExcelUniqueConstraint = [],
    ): Promise<{ rawData: Record<string, any>[], processedData: Record<string, any>[], errors: ExcelCellValidationError[] }> => {

        let workbook;

        try {

            workbook = XLSX.read(fileData, { type: "binary" });

        } catch (e: any) {

            throw new Error("Invalid Excel file format: " + e.message);

        }

        // TODO: Need to discuss with mouli about the date formatting using this property while converting from excel to json { raw: false, dateNF: "mm-dd-yyyy" }
        // Note: When an Excel cell contains a select option with multiple background colors, its value will be converted to a string during parsing.
        // Additionally, if users are tagged in a Lark sheet cell, the cell value will be converted to an empty string—even if the tag appears to contain text.
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[workbook.SheetNames[0]]);

        const excelHeader = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0] as string[];

        if (jsonData.length === 0) {

            throw new Error("No data found in the file.");

        }

        const isValidHeader = validateHeader(schema, excelHeader);

        if (!isValidHeader) {

            throw new Error("Invalid file format. Please check the sample template.");

        }

        const { errors, processedData } = await validateData(jsonData, schema, unique);

        // processedData contains cleaned data with trimmed strings and standardized null values.
        // It consists only of the keys provided in the schema.
        return { rawData: jsonData, processedData, errors };

    };

    return {
        validationProgress,
        isValidationCancelled,
        cancelValidation,
        validateHeader,
        validateData,
        validateExcelFile,
    };

};
