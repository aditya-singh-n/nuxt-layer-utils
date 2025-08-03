// --- Excel Related Types ---

/**
 * Type for Excel cell data types.
 *
 * The "object" data type is used to validate that a cell's value is null, not for actual object types.
 *
 * @example ExcelCellDataType = "string"
 */
export type ExcelCellDataType = "string" | "number" | "boolean" | "object" | undefined;

/**
 * Type for Excel unique constraints. This is used to validate that the data in the Excel file column is unique.
 *
 * **Case 1: Single column.**
 *
 * If the unique constraint is applied on a single column, then declaration should be like this:
 * ```ts
 * // This means that the id should be unique.
 * const uniqueConstraint: ExcelUniqueConstraint = [['id']];
 * ```
 *
 * **Case 2: Multiple columns together.**
 *
 * If the unique constraint is applied on multiple columns together, then declaration should be like this:
 * ```ts
 * // This means that the combination of id and branch_id should be unique.
 * const uniqueConstraint: ExcelUniqueConstraint = [['id', 'branch_id']];
 * ```
 *
 * **Case 3: Multiple columns together along with other single column unique constraint.**
 *
 * If the unique constraint is applied on multiple columns together along with other single column unique constraint, then declaration should be like this:
 * ```ts
 * // This means that the combination of id and branch_id should be unique, and the email should be unique.
 * const uniqueConstraint: ExcelUniqueConstraint = [['id', 'branch_id'], ['email']];
 * ```
 */
export type ExcelUniqueConstraint = string[][];

/**
 * Enum for Excel cell error types.
 *
 * This enum is used to identify the type of error that occurred during the validation of the Excel file.
 *
 * @example ExcelCellErrorType.REQUIRED
 */
export enum ExcelCellErrorType {
    /** Value is required. Example: '' (empty cell) */
    REQUIRED = "required",
    /** Type mismatch. Example: 'abc' in a number column */
    TYPE_MISMATCH = "type_mismatch",
    /** Email rule failed. Example: 'not-an-email' */
    EMAIL_RULE = "email_rule",
    /** Mobile rule failed. Example: '123' */
    MOBILE_RULE = "mobile_rule",
    /** Employee rule failed. Example: 'emp#' */
    EMPLOYEE_RULE = "employee_rule",
    /** Value not in accepted values. Example: 'foo' when only ['bar', 'baz'] allowed */
    ACCEPTED_VALUES = "accepted_values",
    /** Custom validation failed. Example: customValidator returns error */
    CUSTOM_VALIDATION = "custom_validation",
    /** Duplicate value found. Example: duplicate in unique column */
    DUPLICATE = "duplicate"
}

/**
 * Options for exporting data as Excel file.
 * @template T - The type of data being exported.
 * @example
 * const options: ExcelExportOptions<User> = {
 *   data: [{ id: 1, name: 'John' }],
 *   fileName: 'users.xlsx',
 *   sheetName: 'Users'
 * };
 */
export interface ExcelExportOptions<T> {
    /** The data to export. */
    data: T[];
    /** The name of the Excel file. */
    fileName?: string;
    /** The name of the sheet in the Excel file. */
    sheetName?: string;
}

/**
 * Interface for Excel cell validation errors.
 * @example
 * {
 *   row: 2,
 *   column: 'email',
 *   message: 'Invalid email',
 *   errorType: ExcelCellErrorType.EMAIL_RULE
 * }
 */
export interface ExcelCellValidationError {
    row: number | number[];
    column: string;
    message: string;
    errorType: ExcelCellErrorType;
}

/**
 * Interface for Excel validation schema.
 * @example
 * {
 *   email: { required: true, type: 'string', validators: { isEmail: true } },
 *   age: { required: false, type: 'number' }
 * }
 */
export interface ExcelValidationSchema {
    [key: string]: ExcelValidationSchemaOption;
}

/**
 * Options for a single field in the Excel validation schema.
 */
export interface ExcelValidationSchemaOption {
    /** Whether the field is required. */
    required?: boolean;

    /** The expected data type. */
    type: ExcelCellDataType;

    /** Built-in validators. */
    validators?: {
        isEmail?: boolean;
        isMobileNumber?: boolean;
        isEmployeeNumber?: boolean;
    };

    /** List of accepted values. */
    acceptedValues?: (string | number)[];

    /** Custom validator function. Should return true if valid, or an ExcelCellValidationError object if invalid. */
    customValidator?: (value: any, rowData?: Record<string, any>) => ExcelCellValidationError | true;
}

/**
 * Interface defining the return type for the useExcelValidation composable.
 * Provides methods for Excel file validation and progress tracking.
 */
export interface ExcelValidationComposable {
    /**
     * Reactive reference tracking validation progress (0-100).
     */
    validationProgress: Ref<number>;

    /**
     * Reactive reference to track if validation has been cancelled.
     */
    isValidationCancelled: Ref<boolean>;

    /**
     * Function to cancel the ongoing validation process.
     */
    cancelValidation: () => void;

    /**
     * Validates that Excel headers match the expected schema.
     * @param schema - The validation schema containing expected column names
     * @param excelHeader - Array of header strings from the Excel file
     * @returns boolean - True if all required headers are present, false if any are missing
     */
    validateHeader: (schema: ExcelValidationSchema, excelHeader: string[]) => boolean;

    /**
     * Validates Excel data against a schema and unique constraints.
     * @param data - Array of data objects to validate
     * @param schema - Schema defining validation rules for each column
     * @param unique - Array of column combinations that must be unique across rows
     * @returns Promise<{errors: ExcelCellValidationError[], processedData: Record<string, any>[]}> - Object containing validation errors and processed data
     */
    validateData: (
        data: Record<string, any>[],
        schema: ExcelValidationSchema,
        unique?: ExcelUniqueConstraint
    ) => Promise<{ errors: ExcelCellValidationError[], processedData: Record<string, any>[] }>;

    /**
     * Validates an Excel file's content against a schema and unique constraints.
     * @param fileData - The file data (e.g., e.target?.result)
     * @param schema - The Excel validation schema
     * @param unique - The unique constraints
     * @returns Promise<{rawData: Record<string, any>[], processedData: Record<string, any>[], errors: ExcelCellValidationError[]}>
     * - Object containing raw data, processed data and validation errors
     * @throws Error if no data or if required headers are missing
     */
    validateExcelFile: (
        fileData: string | ArrayBuffer,
        schema: ExcelValidationSchema,
        unique?: ExcelUniqueConstraint
    ) => Promise<{ rawData: Record<string, any>[], processedData: Record<string, any>[], errors: ExcelCellValidationError[] }>;
}

/**
 * Custom error class for validation cancellation.
 */
export class ValidationCancellationError extends Error {

    constructor(public errors: ExcelCellValidationError[]) {

        super("Validation stopped. The process was interrupted before completion.");

    }

}
